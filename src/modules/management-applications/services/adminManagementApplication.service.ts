//src/modules/management-applications/services/adminManagementApplication.service.ts
import type {
  AdminManagementApplicationDetail,
  AdminManagementApplicationDetailDto,
} from "../types/adminManagementApplication.types";

import type { ApiResponse } from "../types/managementApplication.types";

import {
  formatAdminDocumentFileSize,
  normalizeAdminApplicationDocumentStatus,
  normalizeAdminApplicationStatus,
  normalizeAdminCheckStatus,
  normalizeAdminDocumentTypeLabel,
  normalizeAdminRiskLevel,
} from "../utils/adminManagementApplication.utils";

const ADMIN_DETAIL_ERROR_KEY = "management-applications:admin.detail.error";
const ADMIN_DETAIL_UNEXPECTED_ERROR_KEY =
  "management-applications:admin.detail.unexpectedError";

const DOWNLOAD_ERROR_KEY =
  "management-applications:admin.document.download.error";
const DOWNLOAD_UNEXPECTED_ERROR_KEY =
  "management-applications:admin.document.download.unexpectedError";

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

async function parseAdminJsonSafe<T>(
  res: Response,
): Promise<ApiResponse<T> | null> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function buildAdminErrorResult<T>(
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

function normalizeAdminErrorResponse<T>(
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

function formatAdminDateTime(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function normalizeNumber(value: unknown): number {
  const parsed =
    typeof value === "number" ? value : Number(String(value ?? "").trim());

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();

    return text && text !== "-" ? text : "-";
  }

  return "-";
}

function normalizeOptionalText(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();

    return text && text !== "-" ? text : null;
  }

  return null;
}

function normalizePropertyTypeLabel(
  propertyTypeText: unknown,
  propertyType: unknown,
): string {
  const text = normalizeOptionalText(propertyTypeText);

  if (text) return text;

  const value = String(propertyType ?? "").trim();

  switch (value) {
    case "1":
      return "Site";
    case "2":
      return "Apartman";
    case "3":
      return "Dükkan";
    case "4":
      return "Ofis";
    case "5":
      return "Villa";
    default:
      return "-";
  }
}

function normalizeRepresentationTypeLabel(
  representationTypeText: unknown,
  representationType: unknown,
): string {
  const text = normalizeOptionalText(representationTypeText);

  if (text) return text;

  const value = String(representationType ?? "").trim().toLowerCase();

  switch (value) {
    case "1":
    case "owner":
      return "Malik";
    case "2":
    case "sitemanager":
      return "Site yöneticisi";
    case "3":
    case "boardmember":
      return "Yönetim kurulu üyesi";
    case "4":
    case "proxy":
      return "Vekil";
    case "5":
    case "companyrepresentative":
      return "Şirket temsilcisi";
    case "6":
    case "professionalmanager":
      return "Profesyonel yönetici";
    case "7":
    case "tenantrepresentative":
      return "Kiracı temsilcisi";
    case "99":
    case "other":
      return "Diğer";
    default:
      return "-";
  }
}

function mapAdminDetailDto(
  data: AdminManagementApplicationDetailDto,
): AdminManagementApplicationDetail {
  const applicant = data.applicant;
  const property = data.property;
  const authority = data.authority;
  const review = data.review;

  const createdAt = formatAdminDateTime(data.submittedAtUtc);
  const updatedAt = formatAdminDateTime(
    data.updatedAt || data.reviewedAtUtc || data.submittedAtUtc,
  );

  const reviewNote = review?.reviewNote ?? data.reviewNote ?? null;
  const reviewedByUserId = review?.reviewedByUserId ?? null;
  const reviewedAtUtc = review?.reviewedAtUtc ?? data.reviewedAtUtc ?? null;

  return {
    applicationId: data.id,
    applicationNumber: data.applicationNumber || data.id,
    status: normalizeAdminApplicationStatus(data.status),
    riskLevel: normalizeAdminRiskLevel(data.riskLevel),
    createdAt,
    updatedAt,

    applicantType: data.applicantType ?? null,
    identityNumberMasked: normalizeOptionalText(
      data.identityNumberMasked ?? applicant?.identityNumberMasked,
    ),
    taxNumberMasked: normalizeOptionalText(data.taxNumberMasked),
    mersisNumberMasked: normalizeOptionalText(data.mersisNumberMasked),

    applicant: {
      userId: applicant?.userId || authority?.applicantUserId || "-",
      fullName: normalizeText(applicant?.fullName),
      email: normalizeText(applicant?.email),
      phone: normalizeText(applicant?.phone),
      isEmailVerified: Boolean(applicant?.isEmailVerified),
      isPhoneVerified: Boolean(applicant?.isPhoneVerified),
      identityNumberMasked: normalizeOptionalText(
        data.identityNumberMasked ?? applicant?.identityNumberMasked,
      ),
    },

    property: {
      propertyName: normalizeText(property?.propertyName),
      description: property?.description || null,
      structureType: normalizePropertyTypeLabel(
        property?.propertyTypeText,
        property?.propertyType,
      ),
      blockCount: normalizeNumber(property?.blockCount),
      residentialUnitCount: normalizeNumber(property?.residentialUnitCount),
      commercialUnitCount: normalizeNumber(property?.commercialUnitCount),
      totalApartmentCount: normalizeNumber(
        property?.totalApartmentCount ??
        Number(property?.residentialUnitCount ?? 0) +
        Number(property?.commercialUnitCount ?? 0),
      ),
      addressId: property?.addressId || null,
      addressSummary: normalizeText(property?.addressSummary),
    },

authority: {
  applicantUserId: authority?.applicantUserId || applicant?.userId || "-",
  reviewedByUserId,
  reviewedAtUtc,
  reviewNote,
  applicantNote: authority?.applicantNote || data.applicantNote || null,

  representationType: normalizeRepresentationTypeLabel(
    authority?.representationTypeText,
    authority?.representationType,
  ),

  requestedRole:
    normalizeOptionalText(authority?.requestedRoleName) || "-",

  authorityStartDate: authority?.authorityStartDateUtc
    ? formatAdminDate(authority.authorityStartDateUtc)
    : "-",

  authorityEndDate: authority?.isAuthorityIndefinite
    ? "Süresiz"
    : authority?.authorityEndDateUtc
      ? formatAdminDate(authority.authorityEndDateUtc)
      : "-",

  authorityScope:
    normalizeOptionalText(authority?.authorityScope) || "-",
},

    documents: Array.isArray(data.documents)
      ? data.documents.map((document) => ({
        id: document.id,
        fileDocumentId: document.fileDocumentId,
        documentType: normalizeAdminDocumentTypeLabel(document.documentType),
        fileName: normalizeText(document.fileName),
        contentType: document.contentType || null,
        fileSize: formatAdminDocumentFileSize(document.fileSize),
        uploadedAt: formatAdminDateTime(document.uploadedAtUtc),
        uploadedAtUtc: document.uploadedAtUtc,
        status: normalizeAdminApplicationDocumentStatus(document.status),
        adminNote: document.reviewNote || undefined,
        isRequired: Boolean(document.isRequired),
        isSensitive: Boolean(document.isSensitive),
        isEncrypted: Boolean(document.isEncrypted),
        isPublic: Boolean(document.isPublic),
        sortOrder: normalizeNumber(document.sortOrder),
      }))
      : [],

    systemChecks: Array.isArray(data.systemChecks)
      ? data.systemChecks.map((check, index) => ({
        id: check.code || `${data.id}:check:${index}`,
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
        actorName: item.actorName || item.actorUserId || "-",
        occurredAt: formatAdminDateTime(item.occurredAtUtc),
        note: item.description || "-",
      }))
      : [],

    reviewNote,
    applicantNote: data.applicantNote || authority?.applicantNote || null,
  };
}

async function getAdminManagementApplicationDetailFromUrl(
  url: string,
): Promise<ApiResponse<AdminManagementApplicationDetail | null>> {
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: jsonHeaders(),
    });

    const json = await parseAdminJsonSafe<AdminManagementApplicationDetailDto>(
      res,
    );

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
      data: json?.data ? mapAdminDetailDto(json.data) : null,
    };
  } catch (error) {
    console.error(
      "[adminManagementApplication.service][getDetail] failed",
      error,
    );

    return buildAdminErrorResult<AdminManagementApplicationDetail | null>(
      ADMIN_DETAIL_UNEXPECTED_ERROR_KEY,
      null,
    );
  }
}

export function getAdminManagementApplicationDetail(
  applicationId: string,
): Promise<ApiResponse<AdminManagementApplicationDetail | null>> {
  return getAdminManagementApplicationDetailFromUrl(
    `/api/v1.0/admin/property-management/applications/${applicationId}`,
  );
}

export function getGlobalAdminManagementApplicationDetail(
  applicationId: string,
): Promise<ApiResponse<AdminManagementApplicationDetail | null>> {
  return getAdminManagementApplicationDetailFromUrl(
    `/api/v1.0/superadmin/property-management/applications/${applicationId}`,
  );
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
 

function formatAdminDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
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
        headers: jsonHeaders({ Accept: "*/*" }),
      },
    );

    if (!res.ok) {
      const json = await parseAdminJsonSafe<null>(res);

      return normalizeAdminErrorResponse(json, DOWNLOAD_ERROR_KEY, null);
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
      "[adminManagementApplication.service][downloadDocument] failed",
      error,
    );

    return buildAdminErrorResult<null>(DOWNLOAD_UNEXPECTED_ERROR_KEY, null);
  }
}