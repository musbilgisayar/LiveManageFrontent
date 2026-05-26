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
  normalizeAdminApplicationDocumentStatus,
  normalizeAdminApplicationStatus,
  normalizeAdminCheckStatus,
  normalizeAdminRiskLevel,
} from "../utils/adminManagementApplication.utils";

const CREATE_ERROR_KEY = "management-applications:create.submit.error";
const CREATE_UNEXPECTED_ERROR_KEY =
  "management-applications:create.submit.unexpectedError";

const LIST_ERROR_KEY = "management-applications:myList.load.error";
const LIST_UNEXPECTED_ERROR_KEY =
  "management-applications:myList.load.unexpectedError";

const DOWNLOAD_ERROR_KEY =
  "management-applications:admin.document.download.error";
const DOWNLOAD_UNEXPECTED_ERROR_KEY =
  "management-applications:admin.document.download.unexpectedError";

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

const ADMIN_DETAIL_ERROR_KEY = "management-applications:admin.detail.error";
const ADMIN_DETAIL_UNEXPECTED_ERROR_KEY =
  "management-applications:admin.detail.unexpectedError";

const GLOBAL_PENDING_LIST_ERROR_KEY =
  "management-applications:superadmin.pendingList.error";
const GLOBAL_PENDING_LIST_UNEXPECTED_ERROR_KEY =
  "management-applications:superadmin.pendingList.unexpectedError";

const managementApplicationListRequests = new Map<
  string,
  Promise<ApiResponse<ManagedPropertyApplicationListItemDto[]>>
>();

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

function isManagedPropertyApplicationDetailDto(
  data: unknown,
): data is ManagedPropertyApplicationDetailDto {
  if (!data || typeof data !== "object") return false;

  const record = data as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.propertyName === "string" &&
    "residentialUnitCount" in record &&
    "status" in record
  );
}

function mapManagedPropertyDetailToAdminDetail(
  data: ManagedPropertyApplicationDetailDto,
): AdminManagementApplicationDetail {
  const createdAt = formatDateTime(data.createdAt || data.submittedAtUtc);

  const updatedAt = formatDateTime(
    data.updatedAt ||
      data.reviewedAtUtc ||
      data.createdAt ||
      data.submittedAtUtc,
  );

  return {
    applicationId: data.id,
    applicationNumber: data.id,
    status: normalizeAdminApplicationStatus(data.status),
    riskLevel: "low",
    createdAt,
    updatedAt,
    applicant: {
      userId: data.applicantUserId,
      fullName: data.applicantUserId,
      email: "-",
      phone: "-",
      emailVerified: false,
      phoneVerified: false,
      identityNumberMasked: data.applicantUserId,
    },
    property: {
      propertyName: data.propertyName || "-",
      structureType: "-",
      blockCount: Number(data.blockCount ?? 0),
      totalApartmentCount: Number(data.residentialUnitCount ?? 0),
      addressSummary: data.addressId || "-",
    },
    authority: {
      representationType: "-",
      requestedRole: "-",
      authorityStartDate: formatDateTime(data.submittedAtUtc),
      authorityEndDate: data.reviewedAtUtc
        ? formatDateTime(data.reviewedAtUtc)
        : undefined,
      authorityScope: data.description || data.applicantNote || "-",
    },
    documents: [],
    systemChecks: [],
    timeline: [
      {
        id: `${data.id}:created`,
        action: "created",
        actorName: data.applicantUserId,
        occurredAt: createdAt,
        note: data.applicantNote || data.description || undefined,
      },
    ],
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

function resolveDownloadFileName(res: Response): string {
  const disposition = res.headers.get("content-disposition");

  if (!disposition) {
    return "application-document";
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(disposition);

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const normalMatch = /filename="?([^"]+)"?/i.exec(disposition);

  return normalMatch?.[1] ?? "application-document";
}

function triggerBrowserDownload(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
}

export async function createManagementApplication(
  payload: CreateManagedPropertyApplicationRequestDto,
): Promise<ApiResponse<CreateManagementApplicationResponseData>> {
  try {
    const res = await fetch("/api/v1.0/property-management/applications", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
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
  const requestKey = "my";
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
      headers: {
        Accept: "application/json",
      },
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
        headers: {
          Accept: "application/json",
        },
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

export async function downloadAdminApplicationDocument(
  documentId: string,
): Promise<ApiResponse<null>> {
  try {
    const res = await fetch(
      `/api/v1.0/admin/property-management/applications/documents/${documentId}/download`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "*/*",
        },
      },
    );

    if (!res.ok) {
      const json = await parseJsonSafe<null>(res);

      return normalizeErrorResponse(json, DOWNLOAD_ERROR_KEY, null);
    }

    const blob = await res.blob();
    const fileName = resolveDownloadFileName(res);

    triggerBrowserDownload(blob, fileName);

    return {
      ok: true,
      message: null,
      userMessage: null,
      data: null,
    };
  } catch (error) {
    console.error(
      "[managementApplication.service][downloadAdminDocument] failed",
      error,
    );

    return buildErrorResult<null>(DOWNLOAD_UNEXPECTED_ERROR_KEY, null);
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
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
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
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
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
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
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

export async function getAdminManagementApplicationDetail(
  applicationId: string,
): Promise<ApiResponse<AdminManagementApplicationDetail | null>> {
  try {
    const res = await fetch(
      `/api/v1.0/admin/property-management/applications/${applicationId}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const json = await parseJsonSafe<
      AdminManagementApplicationDetail | ManagedPropertyApplicationDetailDto
    >(res);

    if (!res.ok) {
      return {
        ok: false,
        message: json?.message ?? ADMIN_DETAIL_ERROR_KEY,
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
    console.error("[managementApplication.service][getAdminDetail] failed", error);

    return buildErrorResult<AdminManagementApplicationDetail | null>(
      ADMIN_DETAIL_UNEXPECTED_ERROR_KEY,
      null,
    );
  }
}

export async function getGlobalAdminManagementApplicationDetail(
  applicationId: string,
): Promise<ApiResponse<AdminManagementApplicationDetail | null>> {
  try {
    const res = await fetch(
      `/api/v1.0/superadmin/property-management/applications/${applicationId}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const json = await parseJsonSafe<
      AdminManagementApplicationDetail | ManagedPropertyApplicationDetailDto
    >(res);

    if (!res.ok) {
      return {
        ok: false,
        message: json?.message ?? ADMIN_DETAIL_ERROR_KEY,
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
    console.error(
      "[managementApplication.service][getGlobalAdminDetail] failed",
      error,
    );

    return buildErrorResult<AdminManagementApplicationDetail | null>(
      ADMIN_DETAIL_UNEXPECTED_ERROR_KEY,
      null,
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
        headers: {
          Accept: "application/json",
        },
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
        headers: {
          Accept: "application/json",
        },
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
        headers: {
          Accept: "application/json",
        },
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
        headers: {
          Accept: "application/json",
        },
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

    const documentTypeMap: Record<string, string> = {
      signed_contract: "ManagementContract",
      authority_decision: "AuthorityDocument",
      power_of_attorney: "AuthorityDocument",
      assignment_letter: "AuthorityDocument",
      professional_service_agreement: "ManagementContract",
      other: "Other",
    };

    formData.append("applicationId", input.applicationId);

    formData.append(
      "documentType",
      documentTypeMap[input.documentType] ?? "Other",
    );

    formData.append("isRequired", String(input.isRequired));
    formData.append("isSensitive", String(input.isSensitive));
    formData.append("sortOrder", String(input.sortOrder));
    formData.append("file", input.file);

    const res = await fetch(
      "/api/v1.0/property-management/applications/documents/upload-file",
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
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
        headers: {
          Accept: "application/json",
        },
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
        headers: {
          Accept: "application/json",
        },
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