// src/modules/users/services/superAdminUsers.service.ts
import {
  getWebFetcher,
  patchWebFetcher,
  postWebFetcher,
} from "@/utils/fetchers.web.client";
import {
  normalizeUserDetailResponse,
  normalizeUserListResponse,
} from "../mappers/userResponse.mapper";
import { AdminUserDetailDto } from "../types/UserDetail.types";
import { UserListQueryParams } from "../types/user.filters.types";
import { PagedResultDto, UserListItemDto } from "../types/user.types";

export type UpdateSuperAdminUserPayload = {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  fullName?: string;
  cultureCode?: string;
  timeZone?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
};

export type UsernameAvailabilityReason =
  | "None"
  | "Invalid"
  | "Taken"
  | "Cooldown"
  | "Same";

export type UsernameAvailabilityDto = {
  isAvailable: boolean;
  normalized: string;
  canChangeNow: boolean;
  nextAllowedAtUtc?: string | null;
  reason?: UsernameAvailabilityReason | null;
};

export type UsernameAvailabilityResponse = {
  ok?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data?: UsernameAvailabilityDto | null;
};

export type SetAdminUsernamePayload = {
  userName: string;
  reason: string;
  overrideCooldown: boolean;
};

export type GenericApiResponse<T = unknown> = {
  ok?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data?: T | null;
};

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord | null {
  return value && typeof value === "object" ? (value as AnyRecord) : null;
}

function readField<T = unknown>(obj: unknown, ...keys: string[]): T | undefined {
  const record = asRecord(obj);
  if (!record) return undefined;

  for (const key of keys) {
    if (key in record) {
      return record[key] as T;
    }
  }

  return undefined;
}

function readString(obj: unknown, ...keys: string[]): string | null {
  const value = readField<unknown>(obj, ...keys);
  return typeof value === "string" ? value : null;
}

function readBoolean(obj: unknown, ...keys: string[]): boolean | undefined {
  const value = readField<unknown>(obj, ...keys);
  return typeof value === "boolean" ? value : undefined;
}

function readNestedData(obj: unknown): unknown[] {
  const values: unknown[] = [];
  let current: unknown = obj;

  for (let i = 0; i < 4; i += 1) {
    const data = readField<unknown>(current, "data", "Data");
    if (data === undefined || data === null) break;
    values.push(data);
    current = data;
  }

  return values;
}

function mapUsernameAvailabilityReason(
  value: unknown
): UsernameAvailabilityReason | null {
  if (typeof value === "string") {
    switch (value) {
      case "None":
      case "Invalid":
      case "Taken":
      case "Cooldown":
      case "Same":
        return value;
      default:
        return null;
    }
  }

  switch (value) {
    case 0:
      return "None";
    case 1:
      return "Invalid";
    case 2:
      return "Taken";
    case 3:
      return "Cooldown";
    case 4:
      return "Same";
    default:
      return null;
  }
}

function normalizeUsernameAvailabilityDto(
  raw: unknown
): UsernameAvailabilityDto | null {
  const record = asRecord(raw);
  if (!record) return null;

  const isAvailable = readBoolean(record, "isAvailable", "IsAvailable");
  if (typeof isAvailable !== "boolean") return null;

  return {
    isAvailable,
    normalized: readString(record, "normalized", "Normalized") ?? "",
    canChangeNow:
      readBoolean(record, "canChangeNow", "CanChangeNow") ?? false,
    nextAllowedAtUtc:
      readString(record, "nextAllowedAtUtc", "NextAllowedAtUtc") ?? null,
    reason: mapUsernameAvailabilityReason(
      readField(record, "reason", "Reason")
    ),
  };
}

function unwrapAvailabilityPayload(input: unknown): unknown {
  const candidates: unknown[] = [input, ...readNestedData(input)];

  for (const candidate of candidates) {
    const isAvailable = readBoolean(candidate, "isAvailable", "IsAvailable");
    if (typeof isAvailable === "boolean") {
      return candidate;
    }
  }

  return null;
}

function extractBffErrorMessage(json: unknown): string | null {
  const error = readField<unknown>(json, "error", "Error");
  const errorRecord = asRecord(error);

  return (
    readString(json, "message", "Message") ||
    readString(json, "userMessage", "UserMessage") ||
    readString(errorRecord, "message", "Message") ||
    readString(errorRecord, "detail", "Detail") ||
    readString(errorRecord, "title", "Title") ||
    null
  );
}

function normalizeGenericApiResponse<T = unknown>(
  json: unknown
): GenericApiResponse<T> {
  return {
    ok: readField<boolean>(json, "ok", "Ok"),
    message: extractBffErrorMessage(json),
    userMessage: readString(json, "userMessage", "UserMessage"),
    data: (readField<T>(json, "data", "Data") ?? null) as T | null,
  };
}

export async function updateSuperAdminUser(
  userId: string,
  payload: UpdateSuperAdminUserPayload
): Promise<AdminUserDetailDto | null> {
  const url = `/api/v1.0/superadmin/users/${userId}`;

  const json = await patchWebFetcher(url, payload);
  return normalizeUserDetailResponse(json);
}

export async function setAdminUsername(
  userId: string,
  payload: SetAdminUsernamePayload
): Promise<GenericApiResponse<boolean>> {
  const url = `/api/v1.0/identity/AppUser/${userId}/set-username`;
  const json = await postWebFetcher(url, payload);

  return normalizeGenericApiResponse<boolean>(json);
}

export async function checkAdminUsernameAvailability(
  userId: string,
  userName: string
): Promise<UsernameAvailabilityResponse> {
  const qs = new URLSearchParams();
  qs.set("userName", userName);

  const url = `/api/v1.0/identity/AppUser/${userId}/username/availability?${qs.toString()}`;
  const json = await getWebFetcher(url);

  const rawDto = unwrapAvailabilityPayload(json);
  const dto = normalizeUsernameAvailabilityDto(rawDto);
  const ok = readField<boolean>(json, "ok", "Ok") ?? true;
  const message = extractBffErrorMessage(json);

  console.log("availability raw json", JSON.stringify(json, null, 2));
  console.log("availability unwrapped dto source", rawDto);
  console.log("availability normalized dto", dto);

  return {
    ok,
    message,
    userMessage: readString(json, "userMessage", "UserMessage"),
    data: dto,
  };
}

export async function getSuperAdminUsers(
  params?: UserListQueryParams
): Promise<PagedResultDto<UserListItemDto>> {
  const qs = new URLSearchParams();

  if (params?.pageNumber) qs.set("pageNumber", String(params.pageNumber));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params?.search) qs.set("search", params.search);

  const url = `/api/v1.0/superadmin/users${qs.toString() ? `?${qs.toString()}` : ""}`;

  const json = await getWebFetcher(url);
  return normalizeUserListResponse(json);
}

export async function getSuperAdminUserDetail(
  userId: string
): Promise<AdminUserDetailDto | null> {
  const url = `/api/v1.0/superadmin/users/${userId}/detail`;

  const json = await getWebFetcher(url);
  return normalizeUserDetailResponse(json);
}