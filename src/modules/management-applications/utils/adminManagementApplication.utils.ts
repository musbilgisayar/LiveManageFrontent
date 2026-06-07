import type {
  AdminApplicationCheckStatus,
  AdminApplicationDecision,
  AdminApplicationDocumentStatus,
  AdminApplicationRiskLevel,
  AdminApplicationStatus,
} from "../types/adminManagementApplication.types";

export function statusLabelKey(status: AdminApplicationStatus) {
  return `admin.detail.status.${normalizeAdminApplicationStatus(status)}`;
}

export function riskLabelKey(risk: AdminApplicationRiskLevel) {
  return `admin.detail.risk.${normalizeAdminRiskLevel(risk)}`;
}

export function documentStatusLabelKey(
  status: AdminApplicationDocumentStatus,
) {
  return `admin.detail.documents.status.${normalizeAdminApplicationDocumentStatus(status)}`;
}

export function decisionButtonLabelKey(decision: AdminApplicationDecision) {
  return `admin.detail.decision.button.${decision}`;
}

export function decisionNoteLabelKey(decision: AdminApplicationDecision) {
  return `admin.detail.decision.note.label.${decision}`;
}

export function decisionNotePlaceholderKey(
  decision: AdminApplicationDecision,
) {
  return `admin.detail.decision.note.placeholder.${decision}`;
}

export function checkStatusLabelKey(status: AdminApplicationCheckStatus) {
  return `admin.detail.systemChecks.status.${normalizeAdminCheckStatus(status)}`;
}

export function checkStatusIconKind(status: AdminApplicationCheckStatus) {
  if (status === "passed") return "check";
  if (status === "failed") return "x";
  return "warning";
}

export function normalizeAdminApplicationStatus(
  value: unknown,
): AdminApplicationStatus {
  const normalized = normalizeEnumValue(value);

  if (normalized === "0") return "pending";
  if (normalized === "1") return "in_review";
  if (normalized === "2") return "missing_information";
  if (normalized === "3") return "approved";
  if (normalized === "4") return "rejected";

  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  if (normalized === "cancelled") return "rejected";
  if (normalized === "under_review") return "in_review";
  if (normalized === "in_review") return "in_review";
  if (normalized === "document_requested") return "missing_information";
  if (normalized === "missing_information") return "missing_information";

  return "pending";
}

export function normalizeAdminApplicationDocumentStatus(
  value: unknown,
): AdminApplicationDocumentStatus {
  const normalized = normalizeEnumValue(value);

  if (normalized === "0") return "missing";
  if (normalized === "1") return "valid";
  if (normalized === "2") return "needs_revision";

  if (normalized === "valid") return "valid";
  if (normalized === "approved") return "valid";

  if (normalized === "rejected") return "needs_revision";
  if (normalized === "needs_revision") return "needs_revision";

  return "missing";
}

export function normalizeAdminDocumentTypeLabel(value: unknown): string {
  const numericValue =
    typeof value === "number" ? value : Number(String(value ?? "").trim());

  switch (numericValue) {
    case 1:
      return "İmzalı Sözleşme";
    case 2:
      return "Yetki Kararı";
    case 3:
      return "Vekâletname";
    case 4:
      return "Görevlendirme Yazısı";
    case 5:
      return "Profesyonel Hizmet Sözleşmesi";
    case 6:
      return "Kimlik Belgesi";
    case 7:
      return "Tapu / Mülkiyet Belgesi";
    case 99:
      return "Diğer Belge";
    default:
      return "-";
  }
}

export function formatAdminDocumentFileSize(value: unknown): string {
  const bytes =
    typeof value === "number" ? value : Number(String(value ?? "").trim());

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "-";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function normalizeAdminRiskLevel(
  value: unknown,
): AdminApplicationRiskLevel {
  const normalized = normalizeEnumValue(value);

  if (normalized === "0") return "low";
  if (normalized === "1") return "medium";
  if (normalized === "2") return "high";
  if (normalized === "3") return "critical";

  if (normalized === "critical") return "critical";
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";

  return "low";
}

export function normalizeAdminApplicantTypeLabel(
  value: unknown,
): string | null {
  const normalized = normalizeEnumValue(value);

  if (!normalized) return null;

  if (
    normalized === "1" ||
    normalized === "individual" ||
    normalized === "individual_applicant"
  ) {
    return "Bireysel";
  }

  if (
    normalized === "2" ||
    normalized === "corporate" ||
    normalized === "corporate_applicant"
  ) {
    return "Kurumsal";
  }

  if (typeof value === "number") {
    return null;
  }

  if (typeof value === "string") {
    const text = String(value).trim();
    return text || null;
  }

  return null;
}

export function normalizeAdminCheckStatus(
  value: unknown,
): AdminApplicationCheckStatus {
  const normalized = normalizeEnumValue(value);

  if (normalized === "0") return "passed";
  if (normalized === "1") return "warning";
  if (normalized === "2") return "failed";

  if (normalized === "passed") return "passed";
  if (normalized === "failed") return "failed";

  return "warning";
}

export function normalizeEnumValue(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

export function documentStatusLabel(status: AdminApplicationDocumentStatus) {
  const normalized = normalizeAdminApplicationDocumentStatus(status);
  if (normalized === "valid") return "Valid";
  if (normalized === "needs_revision") return "Needs revision";
  return "Missing";
}
