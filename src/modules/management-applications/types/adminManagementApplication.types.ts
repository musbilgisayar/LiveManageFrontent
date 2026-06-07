// src/modules/management-applications/types/adminManagementApplication.types.ts
// Yönetim başvurularının admin inceleme ekranı için merkezi type tanımları.
// Not: Backend DTO isimleri korunur; UI modelleri ise ekranda kullanılacak normalize edilmiş alanları taşır.

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
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  identityNumberMasked?: string | null;
};

export type AdminApplicationProperty = {
  propertyName: string;
  description?: string | null;

  /**
   * UI etiketi hâlâ "Structure Type" / "Yapı Türü" olabilir.
   * Backend kaynağı artık propertyType/propertyTypeText alanıdır.
   */
  structureType: string;

  blockCount: number;
  residentialUnitCount: number;
  commercialUnitCount: number;
  totalApartmentCount: number;

  addressId?: string | null;
  addressSummary: string;
};

export type AdminApplicationAuthority = {
  applicantUserId: string;

  reviewedByUserId?: string | null;
  reviewedAtUtc?: string | null;
  reviewNote?: string | null;
  applicantNote?: string | null;

  representationType: string;
  requestedRole: string;
  authorityStartDate: string;
  authorityEndDate?: string;
  authorityScope: string;
};

export type AdminApplicationDocument = {
  id: string;
  fileDocumentId: string;
  documentType: string;
  fileName: string;
  contentType?: string | null;
  fileSize: string;
  uploadedAt: string;
  uploadedAtUtc?: string;
  status: AdminApplicationDocumentStatus;
  adminNote?: string;
  isRequired: boolean;
  isSensitive: boolean;
  isEncrypted: boolean;
  isPublic: boolean;
  sortOrder: number;
};

export type AdminApplicationSystemCheck = {
  id: string;
  label: string;
  description: string;
  status: AdminApplicationCheckStatus;
};

export type AdminApplicationTimelineItem = {
  id: string;
  eventType?: string | null;
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

  applicantType?: number | string | null;
  identityNumberMasked?: string | null;
  taxNumberMasked?: string | null;
  mersisNumberMasked?: string | null;

  applicant: AdminApplicationApplicant;
  property: AdminApplicationProperty;
  authority: AdminApplicationAuthority;
  documents: AdminApplicationDocument[];
  systemChecks: AdminApplicationSystemCheck[];
  timeline: AdminApplicationTimelineItem[];

  reviewNote?: string | null;
  applicantNote?: string | null;
};

export type AdminApplicationApplicantDto = {
  userId: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  identityNumberMasked?: string | null;
};

export type AdminApplicationPropertyDto = {
  propertyName: string;
  description?: string | null;

  /**
   * Backend response:
   * propertyType: 1
   * propertyTypeText: "Site"
   */
  propertyType?: number | string | null;
  propertyTypeText?: string | null;

  addressId?: string | null;
  addressSummary?: string | null;

  residentialUnitCount: number;
  commercialUnitCount: number;
  blockCount?: number | null;
  totalApartmentCount?: number | null;
};

export type AdminApplicationAuthorityDto = {
  applicantUserId?: string | null;

  representationType?: number | string | null;
  representationTypeText?: string | null;

  requestedRoleId?: string | null;
  requestedRoleName?: string | null;

  authorityScope?: string | null;

  authorityStartDateUtc?: string | null;
  authorityEndDateUtc?: string | null;
  isAuthorityIndefinite?: boolean | null;

  applicantNote?: string | null;

  reviewedByUserId?: string | null;
  reviewedAtUtc?: string | null;
  reviewNote?: string | null;
};

export type AdminApplicationReviewDto = {
  reviewDecision?: number | string | null;

  reviewedByUserId?: string | null;
  reviewedAtUtc?: string | null;

  reviewNote?: string | null;
  rejectReason?: string | null;
  requestedDocumentNote?: string | null;

  assignedRoleId?: string | null;
  assignedRoleName?: string | null;

  permissionValidFromUtc?: string | null;
  permissionValidUntilUtc?: string | null;

  notifyApplicant?: boolean | null;
};

export type AdminApplicationDocumentDto = {
  id: string;
  fileDocumentId: string;

  documentType: number;
  documentTypeText?: string | null;

  status: number;
  statusText?: string | null;

  fileName?: string | null;
  contentType?: string | null;
  fileSize?: number | null;

  isRequired: boolean;
  isSensitive: boolean;
  isEncrypted: boolean;
  isPublic: boolean;

  sortOrder: number;

  reviewNote?: string | null;
  reviewedByUserId?: string | null;
  reviewedAtUtc?: string | null;

  uploadedAtUtc: string;
};

export type AdminApplicationSystemCheckDto = {
  code?: string | null;
  label?: string | null;
  status?: string | number | null;
  message?: string | null;
};

export type AdminApplicationTimelineItemDto = {
  eventType?: string | null;
  title?: string | null;
  description?: string | null;
  occurredAtUtc?: string | null;
  actorUserId?: string | null;
  actorName?: string | null;
  correlationId?: string | null;
};

export type AdminManagementApplicationDetailDto = {
  id: string;
  tenantId: string;
  applicationNumber: string;

  status: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical" | string;

  submittedAtUtc: string;
  reviewedAtUtc?: string | null;
  updatedAt?: string | null;

  applicantType?: number | string | null;
  identityNumberMasked?: string | null;
  taxNumberMasked?: string | null;
  mersisNumberMasked?: string | null;

  applicant: AdminApplicationApplicantDto;
  property: AdminApplicationPropertyDto;
  authority: AdminApplicationAuthorityDto;
  review?: AdminApplicationReviewDto | null;

  documents: AdminApplicationDocumentDto[];
  systemChecks: AdminApplicationSystemCheckDto[];
  timeline: AdminApplicationTimelineItemDto[];

  reviewNote?: string | null;
  applicantNote?: string | null;

  autoCreateUnitsAfterApproval: boolean;
  isActive: boolean;
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

export type AdminManagementApplicationListItem = {
  id: string;
  applicationNumber?: string | null;
  applicantName?: string | null;
  applicantEmail?: string | null;
  propertyName?: string | null;
  propertyAddress?: string | null;
  requestedRole?: string | null;
  status: AdminApplicationStatus;
  riskLevel?: AdminApplicationRiskLevel | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  missingDocumentCount?: number | null;
};

export type AdminManagementApplicationReviewFilter = {
  search: string;
  status: AdminApplicationStatus | "all";
  risk: AdminApplicationRiskLevel | "all";
};

export type AdminManagementApplicationReviewSummary = {
  total: number;
  pending: number;
  inReview: number;
  missing: number;
  critical: number;
};