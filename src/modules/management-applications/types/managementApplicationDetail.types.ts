export type ManagementApplicationStatus =
  | "pending"
  | "in_review"
  | "missing_information"
  | "approved"
  | "rejected";

export type ManagementApplicationDetail = {
  applicationId: string;
  applicationNumber: string;

  status: ManagementApplicationStatus;

  createdAt: string;
  updatedAt: string;

  applicant: ManagementApplicationApplicant;
  property: ManagementApplicationProperty;
  authority: ManagementApplicationAuthority;

  documents: ManagementApplicationDocument[];
  timeline: ManagementApplicationTimelineItem[];
};

export type ManagementApplicationApplicant = {
  fullName: string;
  email: string;
  phone: string;

  applicantTypeKey: string;

  identityNumberMasked?: string | null;
  taxNumberMasked?: string | null;
  mersisNumberMasked?: string | null;

  isEmailVerified: boolean;
  isPhoneVerified: boolean;
};

export type ManagementApplicationProperty = {
  propertyName: string;
  description?: string | null;

  propertyTypeKey: string;

  blockCount: number;

  residentialUnitCount: number;
  commercialUnitCount: number;
  totalUnitCount: number;

  addressSummary: string;
};

export type ManagementApplicationAuthority = {
  representationTypeKey: string;

  requestedRole?: string | null;

  authorityStartDate?: string | null;
  authorityEndDate?: string | null;

  isAuthorityIndefinite: boolean;
};

export type ManagementApplicationDocument = {
  id: string;

  documentTypeKey: string;

  fileName: string;

  fileSize: string;

  statusKey: string;

  uploadedAt: string;
};

export type ManagementApplicationTimelineItem = {
  id: string;

  actionKey: string;
  actionFallback?: string | null;

  note?: string | null;

  occurredAt: string;
};