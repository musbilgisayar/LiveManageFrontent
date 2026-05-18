import type {
  AdminApplicationCheckStatus,
  AdminApplicationDecision,
  AdminApplicationDocumentStatus,
  AdminApplicationRiskLevel,
  AdminApplicationStatus,
} from "../types/adminManagementApplication.types";

export function statusLabelKey(status: AdminApplicationStatus) {
  return `admin.detail.status.${status}`;
}

export function riskLabelKey(risk: AdminApplicationRiskLevel) {
  return `admin.detail.risk.${risk}`;
}

export function documentStatusLabelKey(
  status: AdminApplicationDocumentStatus,
) {
  return `admin.detail.documents.status.${status}`;
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
  return `admin.detail.systemChecks.status.${status}`;
}

export function checkStatusIconKind(status: AdminApplicationCheckStatus) {
  if (status === "passed") return "check";
  if (status === "failed") return "x";
  return "warning";
}

export function normalizeAdminApplicationStatus(
  value: string | null | undefined,
): AdminApplicationStatus {
  const normalized = normalizeEnumValue(value);

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
  value: string | null | undefined,
): AdminApplicationDocumentStatus {
  const normalized = normalizeEnumValue(value);

  if (normalized === "valid") return "valid";
  if (normalized === "approved") return "valid";

  if (normalized === "rejected") return "needs_revision";
  if (normalized === "needs_revision") return "needs_revision";

  return "missing";
}

export function normalizeAdminRiskLevel(
  value: string | null | undefined,
): AdminApplicationRiskLevel {
  const normalized = normalizeEnumValue(value);

  if (normalized === "critical") return "critical";
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";

  return "low";
}

export function normalizeAdminCheckStatus(
  value: string | null | undefined,
): AdminApplicationCheckStatus {
  const normalized = normalizeEnumValue(value);

  if (normalized === "passed") return "passed";
  if (normalized === "failed") return "failed";

  return "warning";
}

export function normalizeEnumValue(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}