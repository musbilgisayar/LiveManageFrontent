// src/modules/management-applications/services/managementApplication.service.ts

import type {
  AdminManagementApplicationDetail,
  AdminManagementApplicationListItem,
} from "../types/adminManagementApplication.types";

import type {
  ApiResponse,
  CreateManagedPropertyApplicationRequestDto,
  CreateManagementApplicationResponseData,
  ManagedPropertyApplicationDetailDto,
  ManagedPropertyApplicationDocumentListItemDto,
  ManagedPropertyApplicationDocumentUploadResultDto,
  ManagedPropertyApplicationListItemDto,
  UploadApplicationDocumentInput,
} from "../types/managementApplication.types";

import {
  formatAdminDocumentFileSize,
  normalizeAdminApplicationDocumentStatus,
  normalizeAdminApplicationStatus,
  normalizeAdminCheckStatus,
  normalizeAdminDocumentTypeLabel,
  normalizeAdminRiskLevel,
} from "../utils/adminManagementApplication.utils";

export {
  downloadAdminApplicationDocument,
  getAdminManagementApplicationDetail,
  getGlobalAdminManagementApplicationDetail,
} from "./adminManagementApplication.service";

const CREATE_ERROR_KEY = "management-applications:create.submit.error";
const CREATE_UNEXPECTED_ERROR_KEY =
  "management-applications:create.submit.unexpectedError";

const LIST_ERROR_KEY = "management-applications:myList.load.error";
const LIST_UNEXPECTED_ERROR_KEY =
  "management-applications:myList.load.unexpectedError";

const DOCUMENT_UPLOAD_ERROR_KEY =
  "management-applications:document.upload.error";
const DOCUMENT_UPLOAD_UNEXPECTED_ERROR_KEY =
  "management-applications:document.upload.unexpectedError";

const DOCUMENT_DELETE_ERROR_KEY =
  "management-applications:document.delete.error";
const DOCUMENT_DELETE_UNEXPECTED_ERROR_KEY =
  "management-applications:document.delete.unexpectedError";

const DOCUMENT_LIST_ERROR_KEY = "management-applications:document.list.error";
const DOCUMENT_LIST_UNEXPECTED_ERROR_KEY =
  "management-applications:document.list.unexpectedError";

const ADMIN_PENDING_LIST_ERROR_KEY =
  "management-applications:admin.pendingList.error";
const ADMIN_PENDING_LIST_UNEXPECTED_ERROR_KEY =
  "management-applications:admin.pendingList.unexpectedError";

const ADMIN_APPROVE_ERROR_KEY =
  "management-applications:admin.decision.approve.error";
const ADMIN_APPROVE_UNEXPECTED_ERROR_KEY =
  "management-applications:admin.decision.approve.unexpectedError";

const ADMIN_REJECT_ERROR_KEY =
  "management-applications:admin.decision.reject.error";
const ADMIN_REJECT_UNEXPECTED_ERROR_KEY =
  "management-applications:admin.decision.reject.unexpectedError";

const ADMIN_REVISION_ERROR_KEY =
  "management-applications:admin.decision.revision.error";
const ADMIN_REVISION_UNEXPECTED_ERROR_KEY =
  "management-applications:admin.decision.revision.unexpectedError";

const GLOBAL_PENDING_LIST_ERROR_KEY =
  "management-applications:superadmin.pendingList.error";
const GLOBAL_PENDING_LIST_UNEXPECTED_ERROR_KEY =
  "management-applications:superadmin.pendingList.unexpectedError";

const managementApplicationListRequests = new Map<
  string,
  Promise<ApiResponse<ManagedPropertyApplicationListItemDto[]>>
>();

const LOCALE_TO_CULTURE: Record<string, string> = {
  ar: "ar-SA",
  de: "de-DE",
  en: "en-US",
  fr: "fr-FR",
  it: "it-IT",
  tr: "tr-TR",
};

function getClientAcceptLanguage(): string {
  if (typeof window === "undefined") return "tr-TR";

  const pathLocale = window.location.pathname.split("/")[1]?.toLowerCase();
  const locale = pathLocale || "tr";
  const prefix = locale.split("-")[0];

  return LOCALE_TO_CULTURE[prefix] ?? locale;
}

function jsonHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  headers.set("accept-language", getClientAcceptLanguage());

  return headers;
}

async function parseJsonSafe<T>(res: Response): Promise<ApiResponse<T> | null> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function buildErrorResult<T>(
  code: string,
  data: T | null = null,
): ApiResponse<T> {
  return {
    ok: false,
    message: code,
    userMessage: null,
    data,
  };
}

function normalizeErrorResponse<T>(
  json: ApiResponse<T> | null,
  fallbackCode: string,
  fallbackData: T | null,
): ApiResponse<T> {
  return {
    ok: false,
    message: json?.message ?? fallbackCode,
    userMessage: json?.userMessage ?? null,
    data: json?.data ?? fallbackData,
  };
}

function normalizeAdminListItem(
  item: AdminManagementApplicationListItem,
): AdminManagementApplicationListItem {
  return {
    ...item,
    status: normalizeAdminApplicationStatus(item.status),
    riskLevel:
      item.riskLevel == null
        ? item.riskLevel
        : normalizeAdminRiskLevel(item.riskLevel),
  };
}

function formatDateTime(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "-";

  if (typeof value === "string") {
    const text = value.trim();
    return text.length > 0 ? text : "-";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "-";
}

function readStringPath(source: unknown, path: string): string {
  if (!source || typeof source !== "object") return "";

  let current: unknown = source;

  for (const segment of path.split(".")) {
    if (!current || typeof current !== "object") return "";

    current = (current as Record<string, unknown>)[segment];
  }

  if (typeof current === "string" || typeof current === "number") {
    return String(current).trim();
  }

  return "";
}

function firstNonEmptyString(...values: string[]): string {
  return values.find((value) => value && value !== "-") ?? "";
}

function maskIdentityNumber(value: string): string {
  const text = value.trim();

  if (!text || text === "-") return "-";
  if (text.includes("*") || text.includes("•")) return text;

  const digits = text.replace(/\D/g, "");

  if (digits.length >= 10) {
    return `${digits.slice(0, 3)}******${digits.slice(-2)}`;
  }

  if (digits.length >= 6) {
    return `${digits.slice(0, 2)}****${digits.slice(-2)}`;
  }

  return text.length > 4 ? `${text.slice(0, 2)}****${text.slice(-2)}` : text;
}

function resolveIdentityNumberFromDetail(
  data: ManagedPropertyApplicationDetailDto,
): string {
  const rawValue = firstNonEmptyString(
    readStringPath(data, "applicant.identityNumberMasked"),
    readStringPath(data, "applicant.identityNumber"),
    readStringPath(data, "applicant.nationalIdentityNumber"),
    readStringPath(data, "applicant.nationalId"),
    readStringPath(data, "applicant.taxOrIdentityNumber"),
    readStringPath(data, "authority.identityNumber"),
    readStringPath(data, "authority.taxOrIdentityNumber"),
    readStringPath(data, "identityNumberMasked"),
    readStringPath(data, "identityNumber"),
    readStringPath(data, "nationalIdentityNumber"),
    readStringPath(data, "nationalId"),
    readStringPath(data, "taxOrIdentityNumber"),
  );

  return rawValue ? maskIdentityNumber(rawValue) : "-";
}

function isManagedPropertyApplicationDetailDto(
  data: unknown,
): data is ManagedPropertyApplicationDetailDto {
  if (!data || typeof data !== "object") return false;

  const record = data as Record<string, unknown>;
  const property = record.property;

  return (
    typeof record.id === "string" &&
    property !== null &&
    typeof property === "object" &&
    "status" in record
  );
}

function mapManagedPropertyDetailToAdminDetail(
  data: ManagedPropertyApplicationDetailDto,
): AdminManagementApplicationDetail {
  const applicant = data.applicant;
  const property = data.property;
  const authority = data.authority;
  const review = data.review;

  const createdAt = formatDateTime(data.submittedAtUtc);

  const updatedAt = formatDateTime(
    data.updatedAt ||
    review?.reviewedAtUtc ||
    data.reviewedAtUtc ||
    data.submittedAtUtc,
  );

  const residentialCount = Number(property?.residentialUnitCount ?? 0);
  const commercialCount = Number(property?.commercialUnitCount ?? 0);

  return {
    applicationId: data.id,
    applicationNumber: data.applicationNumber || data.id,
    status: normalizeAdminApplicationStatus(data.status),
    riskLevel: normalizeAdminRiskLevel(data.riskLevel),
    createdAt,
    updatedAt,

    applicant: {
      userId: applicant?.userId || authority?.applicantUserId || "-",
      fullName: normalizeText(applicant?.fullName),
      email: normalizeText(applicant?.email),
      phone: normalizeText(applicant?.phone ?? applicant?.phoneNumber),
      isEmailVerified: Boolean(applicant?.isEmailVerified),
      isPhoneVerified: Boolean(applicant?.isPhoneVerified),
      identityNumberMasked: resolveIdentityNumberFromDetail(data),
    },

    property: {
      propertyName: normalizeText(property?.propertyName),
      structureType: "-",
      blockCount: Number(property?.blockCount ?? 0),
      residentialUnitCount: Number(property?.residentialUnitCount ?? 0),
      commercialUnitCount: Number(property?.commercialUnitCount ?? 0),
      totalApartmentCount: Number(
        property?.totalApartmentCount ??
        Number(property?.residentialUnitCount ?? 0) +
        Number(property?.commercialUnitCount ?? 0),
      ),
      addressSummary: normalizeText(property?.addressSummary),
    },

    authority: {
      applicantUserId: authority?.applicantUserId || applicant?.userId || "-",
      representationType: normalizeText(authority?.representationType),
      requestedRole: normalizeText(authority?.requestedRoleName),
      authorityStartDate: authority?.authorityStartDateUtc
        ? formatDateTime(authority.authorityStartDateUtc)
        : "-",
      authorityEndDate: authority?.isAuthorityIndefinite
        ? undefined
        : authority?.authorityEndDateUtc
          ? formatDateTime(authority.authorityEndDateUtc)
          : undefined,
      authorityScope: normalizeText(authority?.authorityScope),
    },


    documents: Array.isArray(data.documents)
      ? data.documents.map((document) => ({
        id: document.id,
        fileDocumentId: document.fileDocumentId,
        documentType: String(document.documentType),
        fileName: normalizeText(document.fileName),
        fileSize:
          typeof document.fileSize === "number"
            ? `${document.fileSize} B`
            : "-",
        uploadedAt: formatDateTime(document.uploadedAtUtc),
        status: normalizeAdminApplicationDocumentStatus(document.status),
        adminNote: document.reviewNote || undefined,

        isRequired: Boolean(document.isRequired),
        isSensitive: Boolean(document.isSensitive),
        isEncrypted: Boolean(document.isEncrypted),
        isPublic: Boolean(document.isPublic),
        sortOrder: Number(document.sortOrder ?? 0),
      }))
      : [],

    systemChecks: Array.isArray(data.systemChecks)
      ? data.systemChecks.map((check) => ({
        id: check.code,
        label: check.label || check.code || "-",
        description: check.message || "-",
        status: normalizeAdminCheckStatus(check.status),
      }))
      : [],

    timeline: Array.isArray(data.timeline)
      ? data.timeline.map((item, index) => ({
        id: `${data.id}:timeline:${index}`,
        eventType: item.eventType || null,
        action: item.title || item.eventType || "-",
        actorName: item.actorName || "-",
        occurredAt: formatDateTime(item.occurredAtUtc),
        note: item.description || "-",
      }))
      : [],
  };
}

function normalizeAdminDetail(
  data: AdminManagementApplicationDetail | ManagedPropertyApplicationDetailDto | null,
): AdminManagementApplicationDetail | null {
  if (!data) return null;

  if (isManagedPropertyApplicationDetailDto(data)) {
    return mapManagedPropertyDetailToAdminDetail(data);
  }

  return {
    ...data,
    status: normalizeAdminApplicationStatus(data.status),
    riskLevel: normalizeAdminRiskLevel(data.riskLevel),
    documents: Array.isArray(data.documents)
      ? data.documents.map((document) => ({
        ...document,
        status: normalizeAdminApplicationDocumentStatus(document.status),
      }))
      : [],
    systemChecks: Array.isArray(data.systemChecks)
      ? data.systemChecks.map((check) => ({
        ...check,
        status: normalizeAdminCheckStatus(check.status),
      }))
      : [],
    timeline: Array.isArray(data.timeline) ? data.timeline : [],
  };
}

export async function createManagementApplication(
  payload: CreateManagedPropertyApplicationRequestDto,
): Promise<ApiResponse<CreateManagementApplicationResponseData>> {
  try {
    const res = await fetch("/api/v1.0/property-management/applications", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: jsonHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });

    const json = await parseJsonSafe<CreateManagementApplicationResponseData>(
      res,
    );

    if (!res.ok) {
      return normalizeErrorResponse(json, CREATE_ERROR_KEY, null);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: json?.data ?? null,
    };
  } catch (error) {
    console.error("[managementApplication.service][create] failed", error);

    return buildErrorResult<CreateManagementApplicationResponseData>(
      CREATE_UNEXPECTED_ERROR_KEY,
      null,
    );
  }
}

export async function getMyManagementApplications(): Promise<
  ApiResponse<ManagedPropertyApplicationListItemDto[]>
> {
  const requestKey = `my:${getClientAcceptLanguage()}`;
  const existingRequest = managementApplicationListRequests.get(requestKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = getMyManagementApplicationsUncached();
  managementApplicationListRequests.set(requestKey, request);

  try {
    return await request;
  } finally {
    managementApplicationListRequests.delete(requestKey);
  }
}

async function getMyManagementApplicationsUncached(): Promise<
  ApiResponse<ManagedPropertyApplicationListItemDto[]>
> {
  try {
    const res = await fetch("/api/v1.0/property-management/applications", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: jsonHeaders(),
    });

    const json =
      await parseJsonSafe<ManagedPropertyApplicationListItemDto[]>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, LIST_ERROR_KEY, []);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data) ? json.data : [],
    };
  } catch (error) {
    console.error("[managementApplication.service][getMy] failed", error);

    return buildErrorResult<ManagedPropertyApplicationListItemDto[]>(
      LIST_UNEXPECTED_ERROR_KEY,
      [],
    );
  }
}

export async function getMyManagementApplicationDetail(
  applicationId: string,
): Promise<ApiResponse<AdminManagementApplicationDetail | null>> {
  try {
    const res = await fetch(
      `/api/v1.0/property-management/applications/${applicationId}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders(),
      },
    );

    const json = await parseJsonSafe<ManagedPropertyApplicationDetailDto>(res);

    if (!res.ok) {
      return {
        ok: false,
        message: json?.message ?? LIST_ERROR_KEY,
        userMessage: json?.userMessage ?? null,
        data: null,
      };
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: normalizeAdminDetail(json?.data ?? null),
    };
  } catch (error) {
    console.error("[managementApplication.service][getMyDetail] failed", error);

    return buildErrorResult<AdminManagementApplicationDetail | null>(
      LIST_UNEXPECTED_ERROR_KEY,
      null,
    );
  }
}

export type AdminApplicationDecisionRequest = {
  reviewNote?: string | null;
  rejectReason?: string | null;
  requestedDocumentNote?: string | null;
  autoCreateUnitsAfterApproval?: boolean;
};

export async function approveAdminManagementApplication(
  applicationId: string,
  payload: AdminApplicationDecisionRequest,
): Promise<ApiResponse<boolean>> {
  try {
    const res = await fetch(
      `/api/v1.0/admin/property-management/applications/${applicationId}/approve`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      },
    );

    const json = await parseJsonSafe<boolean>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, ADMIN_APPROVE_ERROR_KEY, false);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: json?.data ?? true,
    };
  } catch (error) {
    console.error("[managementApplication.service][approveAdmin] failed", error);

    return buildErrorResult<boolean>(
      ADMIN_APPROVE_UNEXPECTED_ERROR_KEY,
      false,
    );
  }
}

export async function rejectAdminManagementApplication(
  applicationId: string,
  payload: AdminApplicationDecisionRequest,
): Promise<ApiResponse<boolean>> {
  try {
    const res = await fetch(
      `/api/v1.0/admin/property-management/applications/${applicationId}/reject`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      },
    );

    const json = await parseJsonSafe<boolean>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, ADMIN_REJECT_ERROR_KEY, false);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: json?.data ?? true,
    };
  } catch (error) {
    console.error("[managementApplication.service][rejectAdmin] failed", error);

    return buildErrorResult<boolean>(ADMIN_REJECT_UNEXPECTED_ERROR_KEY, false);
  }
}

export async function requestRevisionForAdminManagementApplication(
  applicationId: string,
  payload: AdminApplicationDecisionRequest,
): Promise<ApiResponse<boolean>> {
  try {
    const res = await fetch(
      `/api/v1.0/admin/property-management/applications/${applicationId}/request-document`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      },
    );

    const json = await parseJsonSafe<boolean>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, ADMIN_REVISION_ERROR_KEY, false);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: json?.data ?? true,
    };
  } catch (error) {
    console.error(
      "[managementApplication.service][requestRevision] failed",
      error,
    );

    return buildErrorResult<boolean>(
      ADMIN_REVISION_UNEXPECTED_ERROR_KEY,
      false,
    );
  }
}

export async function getPendingAdminManagementApplications(options?: {
  scope?: "tenant" | "global";
}): Promise<ApiResponse<AdminManagementApplicationListItem[]>> {
  try {
    const query = options?.scope === "global" ? "?scope=all" : "";

    const res = await fetch(
      `/api/v1.0/admin/property-management/applications/pending${query}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders(),
      },
    );

    const json = await parseJsonSafe<AdminManagementApplicationListItem[]>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, ADMIN_PENDING_LIST_ERROR_KEY, []);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data)
        ? json.data.map(normalizeAdminListItem)
        : [],
    };
  } catch (error) {
    console.error("[managementApplication.service][getPendingAdmin] failed", error);

    return buildErrorResult<AdminManagementApplicationListItem[]>(
      ADMIN_PENDING_LIST_UNEXPECTED_ERROR_KEY,
      [],
    );
  }
}

export async function getAdminManagementApplications(): Promise<
  ApiResponse<AdminManagementApplicationListItem[]>
> {
  try {
    const res = await fetch(
      "/api/v1.0/admin/property-management/applications/pending",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders(),
      },
    );

    const json = await parseJsonSafe<AdminManagementApplicationListItem[]>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, ADMIN_PENDING_LIST_ERROR_KEY, []);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data)
        ? json.data.map(normalizeAdminListItem)
        : [],
    };
  } catch (error) {
    console.error("[managementApplication.service][adminPending] failed", error);

    return buildErrorResult<AdminManagementApplicationListItem[]>(
      ADMIN_PENDING_LIST_UNEXPECTED_ERROR_KEY,
      [],
    );
  }
}

export async function getAllManagementApplications(): Promise<
  ApiResponse<AdminManagementApplicationListItem[]>
> {
  try {
    const res = await fetch(
      "/api/v1.0/superadmin/property-management/applications/pending",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders(),
      },
    );

    const json = await parseJsonSafe<AdminManagementApplicationListItem[]>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, GLOBAL_PENDING_LIST_ERROR_KEY, []);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data)
        ? json.data.map(normalizeAdminListItem)
        : [],
    };
  } catch (error) {
    console.error("[managementApplication.service][globalPending] failed", error);

    return buildErrorResult<AdminManagementApplicationListItem[]>(
      GLOBAL_PENDING_LIST_UNEXPECTED_ERROR_KEY,
      [],
    );
  }
}

export async function getGlobalManagementApplications(): Promise<
  ApiResponse<ManagedPropertyApplicationListItemDto[]>
> {
  try {
    const res = await fetch(
      "/api/v1.0/superadmin/property-management/applications",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders(),
      },
    );

    const json =
      await parseJsonSafe<ManagedPropertyApplicationListItemDto[]>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, GLOBAL_PENDING_LIST_ERROR_KEY, []);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data) ? json.data : [],
    };
  } catch (error) {
    console.error(
      "[managementApplication.service][getGlobalApplications] failed",
      error,
    );

    return buildErrorResult<ManagedPropertyApplicationListItemDto[]>(
      GLOBAL_PENDING_LIST_UNEXPECTED_ERROR_KEY,
      [],
    );
  }
}

export async function uploadManagementApplicationDocument(
  input: UploadApplicationDocumentInput,
): Promise<ApiResponse<ManagedPropertyApplicationDocumentUploadResultDto>> {
  try {

    const formData = new FormData();

    formData.append("ApplicationId", input.applicationId);
    formData.append("File", input.file);
    formData.append("DocumentType", String(input.documentType));
    formData.append("IsRequired", String(input.isRequired));
    formData.append("IsSensitive", String(input.isSensitive));
    formData.append("SortOrder", String(input.sortOrder));

    const res = await fetch(
      "/api/v1.0/property-management/applications/documents/upload-file",
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        body: formData,
      },
    );

    const json =
      await parseJsonSafe<ManagedPropertyApplicationDocumentUploadResultDto>(
        res,
      );

    if (!res.ok) {
      return normalizeErrorResponse(json, DOCUMENT_UPLOAD_ERROR_KEY, null);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: json?.data ?? null,
    };
  } catch (error) {
    console.error(
      "[managementApplication.service][uploadDocument] failed",
      error,
    );

    return buildErrorResult<ManagedPropertyApplicationDocumentUploadResultDto>(
      DOCUMENT_UPLOAD_UNEXPECTED_ERROR_KEY,
      null,
    );
  }
}

export async function getManagementApplicationDocuments(
  applicationId: string,
): Promise<ApiResponse<ManagedPropertyApplicationDocumentListItemDto[]>> {
  try {
    const res = await fetch(
      `/api/v1.0/property-management/applications/documents/applications/${applicationId}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders(),
      },
    );

    const json =
      await parseJsonSafe<ManagedPropertyApplicationDocumentListItemDto[]>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, DOCUMENT_LIST_ERROR_KEY, []);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data) ? json.data : [],
    };
  } catch (error) {
    console.error("[managementApplication.service][getDocuments] failed", error);

    return buildErrorResult<ManagedPropertyApplicationDocumentListItemDto[]>(
      DOCUMENT_LIST_UNEXPECTED_ERROR_KEY,
      [],
    );
  }
}

export async function deleteManagementApplicationDocument(
  documentId: string,
): Promise<ApiResponse<boolean>> {
  try {
    const res = await fetch(
      `/api/v1.0/property-management/applications/documents/${documentId}`,
      {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
        headers: jsonHeaders(),
      },
    );

    const json = await parseJsonSafe<boolean>(res);

    if (!res.ok) {
      return normalizeErrorResponse(json, DOCUMENT_DELETE_ERROR_KEY, false);
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: json?.data ?? true,
    };
  } catch (error) {
    console.error("[managementApplication.service][deleteDocument] failed", error);

    return buildErrorResult<boolean>(DOCUMENT_DELETE_UNEXPECTED_ERROR_KEY, false);
  }
}
