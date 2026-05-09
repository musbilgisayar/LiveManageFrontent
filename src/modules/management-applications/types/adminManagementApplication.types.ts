export type AdminApplicationStatus =
  | "pending"
  | "in_review"
  | "missing_information"
  | "approved"
  | "rejected";

export type AdminApplicationRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type AdminApplicationCheckStatus =
  | "passed"
  | "warning"
  | "failed";

export type AdminApplicationDocumentStatus =
  | "valid"
  | "missing"
  | "needs_revision";

export type AdminApplicationDecision =
  | "approve"
  | "revision"
  | "reject";

export type AdminApplicationApplicant = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityNumberMasked: string;
};

export type AdminApplicationProperty = {
  propertyName: string;
  structureType: string;
  blockCount: number;
  totalApartmentCount: number;
  addressSummary: string;
};

export type AdminApplicationAuthority = {
  representationType: string;
  requestedRole: string;
  authorityStartDate: string;
  authorityEndDate?: string;
  authorityScope: string;
};

export type AdminApplicationDocument = {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: AdminApplicationDocumentStatus;
  adminNote?: string;
};

export type AdminApplicationSystemCheck = {
  id: string;
  label: string;
  description: string;
  status: AdminApplicationCheckStatus;
};

export type AdminApplicationTimelineItem = {
  id: string;
  action: string;
  actorName: string;
  occurredAt: string;
  note?: string;
};

export type AdminManagementApplicationDetail = {
  applicationId: string;
  applicationNumber: string;
  status: AdminApplicationStatus;
  riskLevel: AdminApplicationRiskLevel;
  createdAt: string;
  updatedAt: string;
  applicant: AdminApplicationApplicant;
  property: AdminApplicationProperty;
  authority: AdminApplicationAuthority;
  documents: AdminApplicationDocument[];
  systemChecks: AdminApplicationSystemCheck[];
  timeline: AdminApplicationTimelineItem[];
};

export type AdminApplicationDecisionFormState = {
  decision: AdminApplicationDecision;
  assignedRoleId: string;
  permissionScope: string;
  validFrom: string;
  validUntil: string;
  notifyApplicant: "yes" | "no";
  adminNote: string;
};