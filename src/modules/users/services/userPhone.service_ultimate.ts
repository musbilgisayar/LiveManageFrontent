// src/modules/users/services/userPhone.service_ultimate.ts

import { USER_PHONE_API_BASE_ULTIMATE } from "../constants/userPhone.constants_ultimate";
import { mapPhoneErrorToUiUltimate } from "../components/detail/tabs/phone-manager/helpers/phoneErrorMapper_ultimate";

import type {
  GenericApiEnvelopeUltimate,
  UiUserPhoneErrorUltimate,
  UserPhoneListResponseUltimate,
  UserPhoneNumberCreateRequestUltimate,
  UserPhoneNumberDtoUltimate,
  UserPhoneNumberUpdateRequestUltimate,
  UserPhoneTypeUltimate,
} from "../types/UserPhone.types_ultimate";

const USER_PHONE_VERIFICATION_API_BASE_ULTIMATE =
  "/api/v1.0/profile/phone-verification";

export type UserPhoneVerificationSendRequestUltimate = {
  phoneId: string;
};

export type UserPhoneVerificationVerifyRequestUltimate = {
  phoneId: string;
  code: string;
};

async function parseJsonSafeUltimate(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function mapPhoneTypeUltimate(value: unknown): UserPhoneTypeUltimate {
  if (value === "Mobile" || value === 0) return "Mobile";
  if (value === "Home" || value === 1) return "Home";
  if (value === "Work" || value === 2) return "Work";
  return "Other";
}

function normalizePhoneDtoUltimate(raw: unknown): UserPhoneNumberDtoUltimate | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const dto = raw as Record<string, unknown>;

  if (typeof dto.phoneId !== "string" || typeof dto.userId !== "string") {
    return null;
  }

  return {
    phoneId: dto.phoneId,
    userId: dto.userId,
    phoneType: mapPhoneTypeUltimate(dto.phoneType),
    countryCode: typeof dto.countryCode === "string" ? dto.countryCode : "",
    phoneNumber: typeof dto.phoneNumber === "string" ? dto.phoneNumber : "",
    label:
      typeof dto.label === "string" || dto.label === null ? dto.label : null,
    isPrimary: Boolean(dto.isPrimary),
    isVerified:
      typeof dto.isVerified === "boolean" ? dto.isVerified : undefined,
    createdAt: typeof dto.createdAt === "string" ? dto.createdAt : undefined,
    updatedAt: typeof dto.updatedAt === "string" ? dto.updatedAt : undefined,
  };
}

function unwrapListResponseUltimate(raw: unknown): UserPhoneNumberDtoUltimate[] {
  const envelope = raw as GenericApiEnvelopeUltimate<
    UserPhoneListResponseUltimate | UserPhoneNumberDtoUltimate[]
  > | null;

  if (Array.isArray(raw)) {
    return raw
      .map(normalizePhoneDtoUltimate)
      .filter((item): item is UserPhoneNumberDtoUltimate => item !== null);
  }

  if (envelope?.data) {
    if (Array.isArray(envelope.data)) {
      return envelope.data
        .map(normalizePhoneDtoUltimate)
        .filter((item): item is UserPhoneNumberDtoUltimate => item !== null);
    }

    if (
      typeof envelope.data === "object" &&
      envelope.data !== null &&
      Array.isArray((envelope.data as UserPhoneListResponseUltimate).items)
    ) {
      return (envelope.data as UserPhoneListResponseUltimate).items
        .map(normalizePhoneDtoUltimate)
        .filter((item): item is UserPhoneNumberDtoUltimate => item !== null);
    }
  }

  return [];
}

function unwrapSingleResponseUltimate(raw: unknown): UserPhoneNumberDtoUltimate | null {
  const envelope = raw as GenericApiEnvelopeUltimate<UserPhoneNumberDtoUltimate> | null;

  if (raw && typeof raw === "object" && "phoneId" in (raw as object)) {
    return normalizePhoneDtoUltimate(raw);
  }

  if (envelope?.data && typeof envelope.data === "object") {
    return normalizePhoneDtoUltimate(envelope.data);
  }

  return null;
}


function readStringUltimate(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function extractErrorMessageUltimate(raw: unknown, fallback: string): string {
  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const obj = raw as Record<string, unknown>;

  // en yaygın alanlar
  const directMessage =
    readStringUltimate(obj.message) ??
    readStringUltimate(obj.userMessage) ??
    readStringUltimate(obj.error) ??
    readStringUltimate(obj.title) ??
    readStringUltimate(obj.detail);

  if (directMessage) {
    return directMessage;
  }

  // Generic envelope içi
  if (obj.data && typeof obj.data === "object") {
    const data = obj.data as Record<string, unknown>;

    const nestedMessage =
      readStringUltimate(data.message) ??
      readStringUltimate(data.userMessage) ??
      readStringUltimate(data.error) ??
      readStringUltimate(data.title) ??
      readStringUltimate(data.detail);

    if (nestedMessage) {
      return nestedMessage;
    }
  }

  // ASP.NET validation/problem details
  if (obj.errors && typeof obj.errors === "object") {
    const errors = obj.errors as Record<string, unknown>;

    for (const value of Object.values(errors)) {
      if (Array.isArray(value) && value.length > 0) {
        const first = value.find((x) => typeof x === "string");
        if (typeof first === "string" && first.trim()) {
          return first.trim();
        }
      }
    }
  }

  return fallback;
}


async function handleErrorUltimate(response: Response): Promise<never> {
  const raw = await parseJsonSafeUltimate(response);

  const extractedMessage = extractErrorMessageUltimate(
    raw,
    response.statusText || "Unexpected error"
  );

  const normalized = mapPhoneErrorToUiUltimate(
    typeof raw === "object" && raw !== null
      ? {
          ...(raw as object),
          message: extractedMessage,
          userMessage: extractedMessage,
          status: response.status,
        }
      : {
          message: extractedMessage,
          userMessage: extractedMessage,
          status: response.status,
        }
  );

  const finalMessage =
  extractedMessage || normalized.message || "Unexpected error";

const error = new Error(finalMessage);

  (error as any).code = normalized.code;
  (error as any).status = normalized.status;
  (error as any).details = normalized;
  (error as any).raw = raw;

  throw error;
}


export async function getUserPhoneNumbersUltimate(
  userId: string
): Promise<UserPhoneNumberDtoUltimate[]> {
  const response = await fetch(
    `${USER_PHONE_API_BASE_ULTIMATE}?userId=${encodeURIComponent(userId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    await handleErrorUltimate(response);
  }

  const raw = await parseJsonSafeUltimate(response);
  return unwrapListResponseUltimate(raw);
}

export async function createUserPhoneNumberUltimate(
  payload: UserPhoneNumberCreateRequestUltimate
): Promise<UserPhoneNumberDtoUltimate | null> {
  const response = await fetch(USER_PHONE_API_BASE_ULTIMATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await handleErrorUltimate(response);
  }

  const raw = await parseJsonSafeUltimate(response);
  return unwrapSingleResponseUltimate(raw);
}

export async function updateUserPhoneNumberUltimate(
  payload: UserPhoneNumberUpdateRequestUltimate
): Promise<UserPhoneNumberDtoUltimate | null> {
  const response = await fetch(
    `${USER_PHONE_API_BASE_ULTIMATE}/${encodeURIComponent(payload.phoneId)}?userId=${encodeURIComponent(payload.userId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    await handleErrorUltimate(response);
  }

  const raw = await parseJsonSafeUltimate(response);
  return unwrapSingleResponseUltimate(raw);
}

export async function deleteUserPhoneNumberUltimate(
  userId: string,
  phoneId: string
): Promise<void> {
  const response = await fetch(
    `${USER_PHONE_API_BASE_ULTIMATE}/${encodeURIComponent(phoneId)}?userId=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    await handleErrorUltimate(response);
  }
}

export async function sendUserPhoneVerificationCodeUltimate(
  payload: UserPhoneVerificationSendRequestUltimate
): Promise<void> {
  const response = await fetch(
    `${USER_PHONE_VERIFICATION_API_BASE_ULTIMATE}/send-code`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    await handleErrorUltimate(response);
  }
}

export async function verifyUserPhoneCodeUltimate(
  payload: UserPhoneVerificationVerifyRequestUltimate
): Promise<void> {
  const response = await fetch(
    `${USER_PHONE_VERIFICATION_API_BASE_ULTIMATE}/verify-code`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    await handleErrorUltimate(response);
  }
}

export type UserPhoneServiceErrorUltimate = UiUserPhoneErrorUltimate;