import type {
  AdminApplicationCheckStatus,
  AdminApplicationDecision,
  AdminApplicationDocumentStatus,
  AdminApplicationRiskLevel,
  AdminApplicationStatus,
} from "../types/adminManagementApplication.types";

export function statusLabel(status: AdminApplicationStatus) {
  if (status === "approved") return "Onaylandı";
  if (status === "rejected") return "Reddedildi";
  if (status === "missing_information") return "Eksik Bilgi";
  if (status === "in_review") return "İncelemede";
  return "Bekliyor";
}

export function riskLabel(risk: AdminApplicationRiskLevel) {
  if (risk === "critical") return "Kritik";
  if (risk === "high") return "Yüksek";
  if (risk === "medium") return "Orta";
  return "Düşük";
}

export function documentStatusLabel(status: AdminApplicationDocumentStatus) {
  if (status === "valid") return "Geçerli";
  if (status === "needs_revision") return "Revizyon Gerekli";
  return "Eksik";
}

export function decisionButtonLabel(decision: AdminApplicationDecision) {
  if (decision === "approve") return "Onayla ve Yetki Ata";
  if (decision === "revision") return "Revizyon İste";
  return "Başvuruyu Reddet";
}

export function decisionNoteLabel(decision: AdminApplicationDecision) {
  if (decision === "approve") return "Admin notu";
  if (decision === "revision") return "Eksik bilgi / belge açıklaması";
  return "Red gerekçesi";
}

export function decisionNotePlaceholder(decision: AdminApplicationDecision) {
  if (decision === "approve") {
    return "Onay ve yetki atamasıyla ilgili iç değerlendirme notu yazın...";
  }

  if (decision === "revision") {
    return "Hangi bilgi veya belgenin eksik olduğunu yazın...";
  }

  return "Başvurunun neden reddedildiğini yazın...";
}

export function checkStatusIconKind(status: AdminApplicationCheckStatus) {
  if (status === "passed") return "check";
  if (status === "failed") return "x";
  return "warning";
}