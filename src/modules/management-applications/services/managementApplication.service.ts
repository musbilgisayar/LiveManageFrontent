import type {
  AdminManagementApplicationDetail,
} from "../types/adminManagementApplication.types";
import type {
  ApiResponse,
  CreateManagedPropertyApplicationRequestDto,
  CreateManagementApplicationResponseData,
  ManagedPropertyApplicationListItemDto,
} from "../types/managementApplication.types";

import type {
  AdminManagementApplicationListItem,
} from "../types/adminManagementApplication.types";

const CREATE_ERROR_KEY = "property:managementApplication.create.submit.error";
const CREATE_UNEXPECTED_ERROR_KEY =
  "property:managementApplication.create.submit.unexpectedError";

const LIST_ERROR_KEY = "property:managementApplication.list.load.error";
const LIST_UNEXPECTED_ERROR_KEY =
  "property:managementApplication.list.load.unexpectedError";

const DOWNLOAD_ERROR_KEY =
  "property:managementApplication.admin.document.download.error";

const DOWNLOAD_UNEXPECTED_ERROR_KEY =
  "property:managementApplication.admin.document.download.unexpectedError";

  const ADMIN_PENDING_LIST_ERROR_KEY =
  "property:managementApplication.admin.pendingList.error";

const ADMIN_PENDING_LIST_UNEXPECTED_ERROR_KEY =
  "property:managementApplication.admin.pendingList.unexpectedError";

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
      return normalizeErrorResponse(
        json,
        CREATE_ERROR_KEY,
        null,
      );
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
      return normalizeErrorResponse(
        json,
        LIST_ERROR_KEY,
        [],
      );
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

      return normalizeErrorResponse(
        json,
        DOWNLOAD_ERROR_KEY,
        null,
      );
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

    return buildErrorResult<null>(
      DOWNLOAD_UNEXPECTED_ERROR_KEY,
      null,
    );
  }
}
const ADMIN_APPROVE_ERROR_KEY =
  "property:managementApplication.admin.decision.approve.error";
const ADMIN_APPROVE_UNEXPECTED_ERROR_KEY =
  "property:managementApplication.admin.decision.approve.unexpectedError";

const ADMIN_REJECT_ERROR_KEY =
  "property:managementApplication.admin.decision.reject.error";
const ADMIN_REJECT_UNEXPECTED_ERROR_KEY =
  "property:managementApplication.admin.decision.reject.unexpectedError";

const ADMIN_REVISION_ERROR_KEY =
  "property:managementApplication.admin.decision.revision.error";
const ADMIN_REVISION_UNEXPECTED_ERROR_KEY =
  "property:managementApplication.admin.decision.revision.unexpectedError";

export type AdminApplicationDecisionRequest = {
  reviewNote?: string | null;
  notifyApplicant?: boolean;
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

    return buildErrorResult<boolean>(
      ADMIN_REJECT_UNEXPECTED_ERROR_KEY,
      false,
    );
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
    console.error("[managementApplication.service][requestRevision] failed", error);

    return buildErrorResult<boolean>(
      ADMIN_REVISION_UNEXPECTED_ERROR_KEY,
      false,
    );
  }
}
///***** */
const ADMIN_DETAIL_ERROR_KEY =
  "property:managementApplication.admin.detail.error";

const ADMIN_DETAIL_UNEXPECTED_ERROR_KEY =
  "property:managementApplication.admin.detail.unexpectedError";

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

    const json =
      await parseJsonSafe<AdminManagementApplicationDetail>(res);

    if (!res.ok) {
      return normalizeErrorResponse(
        json,
        ADMIN_DETAIL_ERROR_KEY,
        null,
      );
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: json?.data ?? null,
    };
  } catch (error) {
    console.error(
      "[managementApplication.service][getAdminDetail] failed",
      error,
    );

    return buildErrorResult<AdminManagementApplicationDetail | null>(
      ADMIN_DETAIL_UNEXPECTED_ERROR_KEY,
      null,
    );
  }
}
export async function getPendingAdminManagementApplications(): Promise<
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

    const json =
      await parseJsonSafe<AdminManagementApplicationListItem[]>(res);

    if (!res.ok) {
      return normalizeErrorResponse(
        json,
        ADMIN_PENDING_LIST_ERROR_KEY,
        [],
      );
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data) ? json.data : [],
    };
  } catch (error) {
    console.error(
      "[managementApplication.service][getPendingAdmin] failed",
      error,
    );

    return buildErrorResult<AdminManagementApplicationListItem[]>(
      ADMIN_PENDING_LIST_UNEXPECTED_ERROR_KEY,
      [],
    );
  }
}