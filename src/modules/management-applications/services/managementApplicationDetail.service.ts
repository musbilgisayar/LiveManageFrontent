import type { ApiResponse } from "../types/managementApplication.types";

import type {
  ManagementApplicationDetail,
  ManagementApplicationDocument,
  ManagementApplicationStatus,
} from "../types/managementApplicationDetail.types";

type BackendDetailDto = {
  id: string;
  applicationNumber?: string | null;
  status?: number | string | null;
  submittedAtUtc?: string | null;
  reviewedAtUtc?: string | null;
  updatedAt?: string | null;

  applicantType?: number | string | null;
  identityNumberMasked?: string | null;
  taxNumberMasked?: string | null;
  mersisNumberMasked?: string | null;

  applicant?: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    isEmailVerified?: boolean | null;
    isPhoneVerified?: boolean | null;
    identityNumberMasked?: string | null;
  } | null;

  property?: {
    propertyName?: string | null;
    description?: string | null;
    propertyType?: number | string | null;
    propertyTypeText?: string | null;
    addressSummary?: string | null;
    residentialUnitCount?: number | null;
    commercialUnitCount?: number | null;
    blockCount?: number | null;
    totalApartmentCount?: number | null;
  } | null;

  authority?: {
    representationType?: number | string | null;
    representationTypeText?: string | null;
    requestedRoleName?: string | null;
    authorityStartDateUtc?: string | null;
    authorityEndDateUtc?: string | null;
    isAuthorityIndefinite?: boolean | null;
  } | null;

  documents?: BackendDocumentDto[] | null;
  timeline?: BackendTimelineItemDto[] | null;
};

type BackendDocumentDto = {
  id: string;
  documentType?: number | string | null;
  documentTypeText?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  status?: number | string | null;
  statusText?: string | null;
  uploadedAtUtc?: string | null;
};

type BackendTimelineItemDto = {
  eventType?: string | null;
  title?: string | null;
  description?: string | null;
  occurredAtUtc?: string | null;
};

const DETAIL_ERROR_KEY = "management-applications:detail.load.error";
const DETAIL_UNEXPECTED_ERROR_KEY =
  "management-applications:detail.load.unexpectedError";

const LOCALE_TO_CULTURE: Record<string, string> = {
  ar: "ar-SA",
  de: "de-DE",
  en: "en-US",
  fr: "fr-FR",
  it: "it-IT",
  tr: "tr-TR",
};

export async function getManagementApplicationDetail(
  applicationId: string,
): Promise<ApiResponse<ManagementApplicationDetail | null>> {
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

    const json = await parseJsonSafe<BackendDetailDto>(res);

    if (!res.ok) {
      return {
        ok: false,
        message: json?.message ?? DETAIL_ERROR_KEY,
        userMessage: json?.userMessage ?? null,
        data: null,
      };
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: json?.data ? mapDetail(json.data) : null,
    };
  } catch (error) {
    console.error(
      "[managementApplicationDetail.service][getDetail] failed",
      error,
    );

    return {
      ok: false,
      message: DETAIL_UNEXPECTED_ERROR_KEY,
      userMessage: null,
      data: null,
    };
  }
}

function mapDetail(dto: BackendDetailDto): ManagementApplicationDetail {
  const applicant = dto.applicant;
  const property = dto.property;
  const authority = dto.authority;

  const residentialUnitCount = numberValue(property?.residentialUnitCount);
  const commercialUnitCount = numberValue(property?.commercialUnitCount);

  return {
    applicationId: dto.id,
    applicationNumber: text(dto.applicationNumber || dto.id),
    status: normalizeStatus(dto.status),

    createdAt: formatDateTime(dto.submittedAtUtc),
    updatedAt: formatDateTime(
      dto.updatedAt || dto.reviewedAtUtc || dto.submittedAtUtc,
    ),

    applicant: {
      fullName: text(applicant?.fullName),
      email: text(applicant?.email),
      phone: text(applicant?.phone),

      applicantTypeKey: applicantTypeKey(dto.applicantType),

      identityNumberMasked:
        optionalText(dto.identityNumberMasked) ||
        optionalText(applicant?.identityNumberMasked),

      taxNumberMasked: optionalText(dto.taxNumberMasked),
      mersisNumberMasked: optionalText(dto.mersisNumberMasked),

      isEmailVerified: Boolean(applicant?.isEmailVerified),
      isPhoneVerified: Boolean(applicant?.isPhoneVerified),
    },

    property: {
      propertyName: text(property?.propertyName),
      description: optionalText(property?.description),

      propertyTypeKey: propertyTypeKey(property?.propertyType),

      blockCount: numberValue(property?.blockCount),
      residentialUnitCount,
      commercialUnitCount,
      totalUnitCount: numberValue(
        property?.totalApartmentCount ??
          residentialUnitCount + commercialUnitCount,
      ),

      addressSummary: text(property?.addressSummary),
    },

    authority: {
      representationTypeKey: representationTypeKey(
        authority?.representationType,
      ),

      requestedRole: optionalText(authority?.requestedRoleName),

      authorityStartDate: authority?.authorityStartDateUtc
        ? formatDate(authority.authorityStartDateUtc)
        : null,

      authorityEndDate: authority?.isAuthorityIndefinite
        ? "management-applications:detail.authority.indefinite"
        : authority?.authorityEndDateUtc
          ? formatDate(authority.authorityEndDateUtc)
          : null,

      isAuthorityIndefinite: Boolean(authority?.isAuthorityIndefinite),
    },

    documents: Array.isArray(dto.documents)
      ? dto.documents.map(mapDocument)
      : [],

    timeline: Array.isArray(dto.timeline)
      ? dto.timeline.map((item, index) => ({
          id: `${dto.id}:timeline:${index}`,
          actionKey: timelineActionKey(item.eventType),
          actionFallback: optionalText(item.title || item.eventType),
          note: optionalText(item.description),
          occurredAt: formatDateTime(item.occurredAtUtc),
        }))
      : [],
  };
}

function mapDocument(document: BackendDocumentDto): ManagementApplicationDocument {
  return {
    id: document.id,
    documentTypeKey: documentTypeKey(document.documentType),
    fileName: text(document.fileName),
    fileSize: formatFileSize(document.fileSize),
    statusKey: documentStatusKey(document.status),
    uploadedAt: formatDateTime(document.uploadedAtUtc),
  };
}

function jsonHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  headers.set("accept-language", getClientAcceptLanguage());

  return headers;
}

function getClientAcceptLanguage(): string {
  if (typeof window === "undefined") return "tr-TR";

  const pathLocale = window.location.pathname.split("/")[1]?.toLowerCase();
  const locale = pathLocale || "tr";
  const prefix = locale.split("-")[0];

  return LOCALE_TO_CULTURE[prefix] ?? locale;
}

async function parseJsonSafe<T>(
  res: Response,
): Promise<ApiResponse<T> | null> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function text(value: unknown): string {
  const normalized = optionalText(value);

  return normalized ?? "-";
}

function optionalText(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  const result = String(value).trim();

  return result.length > 0 && result !== "-" ? result : null;
}

function numberValue(value: unknown): number {
  const parsed =
    typeof value === "number" ? value : Number(String(value ?? "").trim());

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatus(value: unknown): ManagementApplicationStatus {
  const normalized = String(value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "0":
    case "pending":
      return "pending";
    case "1":
    case "inreview":
    case "in_review":
      return "in_review";
    case "2":
    case "missinginformation":
    case "missing_information":
    case "documentrequested":
      return "missing_information";
    case "3":
    case "approved":
      return "approved";
    case "4":
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
}

function applicantTypeKey(value: unknown): string {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "1" || normalized === "individual") {
    return "management-applications:detail.applicantType.individual";
  }

  if (normalized === "2" || normalized === "company") {
    return "management-applications:detail.applicantType.company";
  }

  return "management-applications:detail.common.notProvided";
}

function propertyTypeKey(value: unknown): string {
  const normalized = String(value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "1":
    case "site":
      return "management-applications:detail.propertyType.site";
    case "2":
    case "apartment":
      return "management-applications:detail.propertyType.apartment";
    case "3":
    case "shop":
      return "management-applications:detail.propertyType.shop";
    case "4":
    case "office":
      return "management-applications:detail.propertyType.office";
    case "5":
    case "villa":
      return "management-applications:detail.propertyType.villa";
    default:
      return "management-applications:detail.common.notProvided";
  }
}

function representationTypeKey(value: unknown): string {
  const normalized = String(value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "1":
    case "owner":
      return "management-applications:detail.representationType.owner";
    case "2":
    case "sitemanager":
      return "management-applications:detail.representationType.siteManager";
    case "3":
    case "boardmember":
      return "management-applications:detail.representationType.boardMember";
    case "4":
    case "proxy":
      return "management-applications:detail.representationType.proxy";
    case "5":
    case "companyrepresentative":
      return "management-applications:detail.representationType.companyRepresentative";
    case "6":
    case "professionalmanager":
      return "management-applications:detail.representationType.professionalManager";
    case "7":
    case "tenantrepresentative":
      return "management-applications:detail.representationType.tenantRepresentative";
    case "99":
    case "other":
      return "management-applications:detail.representationType.other";
    default:
      return "management-applications:detail.common.notProvided";
  }
}

function documentTypeKey(value: unknown): string {
  const normalized = String(value ?? "").trim();

  switch (normalized) {
    case "1":
      return "management-applications:detail.documentType.signedServiceContract";
    case "2":
      return "management-applications:detail.documentType.managementDecision";
    case "3":
      return "management-applications:detail.documentType.powerOfAttorney";
    case "4":
      return "management-applications:detail.documentType.identityDocument";
    case "5":
      return "management-applications:detail.documentType.taxDocument";
    case "99":
      return "management-applications:detail.documentType.other";
    default:
      return "management-applications:detail.common.notProvided";
  }
}

function documentStatusKey(value: unknown): string {
  const normalized = String(value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "1":
    case "valid":
    case "approved":
      return "management-applications:detail.documentStatus.valid";
    case "2":
    case "missing":
      return "management-applications:detail.documentStatus.missing";
    case "3":
    case "needsrevision":
    case "needs_revision":
    case "rejected":
      return "management-applications:detail.documentStatus.needsRevision";
    default:
      return "management-applications:detail.common.notProvided";
  }
}

function timelineActionKey(value: unknown): string {
  const normalized = String(value ?? "").trim();

  switch (normalized) {
    case "application.created":
      return "management-applications:detail.timeline.applicationCreated";
    case "document.uploaded":
      return "management-applications:detail.timeline.documentUploaded";
    default:
      return "management-applications:detail.timeline.unknown";
  }
}

function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

function formatDateTime(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function formatFileSize(value: unknown): string {
  const size = numberValue(value);

  if (size <= 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}