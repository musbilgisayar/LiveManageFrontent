// src/modules/management-applications/types/managementApplication.types.ts
//bu dosya yönetim başvuruları modülünde kullanılan tür tanımlarını içermektedir. Yönetim başvuruları modülü, kullanıcıların mülk yönetimi için başvuru yapmalarını, başvurularını incelemelerini ve yöneticilerin bu başvurular üzerinde karar vermelerini sağlayan bir dizi özellik sunar. Bu tür tanımları, modülün farklı bileşenleri ve işlevleri arasında tutarlı veri yapıları kullanılmasını sağlar.

export type ManagementStructureType = "site" | "apartment";

export type RepresentationType =
  | "owner"
  | "proxy"
  | "board_member"
  | "professional_manager";

export type RequiredDocumentKind =
  | "SignedContract"
  | "AuthorityDecision"
  | "PowerOfAttorney"
  | "AssignmentLetter"
  | "ProfessionalServiceAgreement"
  | "IdentityDocument"
  | "PropertyRegistryDocument"
  | "Other";

export type UploadedFileItem = {
  id: string;
  name: string;
  sizeLabel: string;
  kind: RequiredDocumentKind;
  description?: string;
  file: File;
  backendDocumentId?: string;
  fileDocumentId?: string;
  sortOrder?: number;
  uploadStatus?: "local" | "uploading" | "uploaded" | "failed";
  errorMessage?: string;
};

export type ManagementApplicationAddressForm = {
  addressId?: string | null;
  country: string;
  countryCode: string;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  provinceId: string;
  districtId: string;
  neighborhoodId: string;
};

export type ManagementApplicationFormState = {
  structureType: ManagementStructureType;
  propertyName: string;
  representationType: RepresentationType;
  blockCount: string;
  totalApartmentCount: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  taxOrIdentityNumber: string;
  authorityStartDate: string;
  authorityEndDate: string;
  address: ManagementApplicationAddressForm;
  note: string;
  consentAccuracy: boolean;
  consentAuthority: boolean;
  consentPrivacy: boolean;
  consentContract: boolean;
};

export type ManagementApplicationFormErrors = Partial<Record<string, string>>;

export type DocumentRequirement = {
  kind: RequiredDocumentKind;
  title: string;
  description: string;
  required: boolean;
};

export type WizardStepId = "basic" | "address" | "documents" | "review";

export type WizardStep = {
  id: WizardStepId;
  index: number;
  title: string;
  description: string;
};

export type CreateManagedPropertyApplicationRequestDto = {
  propertyName: string;
  description?: string | null;
  addressId?: string | null;
  residentialUnitCount: number;
  commercialUnitCount: number;
  blockCount?: number | null;
  applicantNote?: string | null;
  autoCreateUnitsAfterApproval: boolean;
};

export type ManagedPropertyApplicationStatus = number;
export type ManagedPropertyApplicationDocumentType = number;
export type ManagedPropertyApplicationDocumentStatus = number;

export type ManagedPropertyApplicationApplicantDto = {
  userId: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
};

export type ManagedPropertyApplicationPropertyDto = {
  managedPropertyId?: string | null;
  propertyName: string;
  description?: string | null;
  addressId?: string | null;
  addressText?: string | null;
  residentialUnitCount: number;
  commercialUnitCount: number;
  blockCount?: number | null;
};

export type ManagedPropertyApplicationAuthorityDto = {
  applicantUserId: string;
  reviewedByUserId?: string | null;
  reviewedAtUtc?: string | null;
  reviewNote?: string | null;
  rejectReason?: string | null;
  applicantNote?: string | null;
};

export type ManagedPropertyApplicationDocumentDto = {
  id: string;
  fileDocumentId: string;
  documentType: ManagedPropertyApplicationDocumentType;
  status: ManagedPropertyApplicationDocumentStatus;
  fileName?: string | null;
  contentType?: string | null;
  fileSize?: number | null;
  isRequired: boolean;
  isSensitive: boolean;
  sortOrder: number;
  reviewNote?: string | null;
  reviewedByUserId?: string | null;
  reviewedAtUtc?: string | null;
  uploadedAtUtc: string;
  isEncrypted: boolean;
  isPublic: boolean;
};

export type ManagedPropertyApplicationSystemCheckDto = {
  code: string;
  label: string;
  status: string;
  message?: string | null;
};

export type ManagedPropertyApplicationTimelineItemDto = {
  eventType: string;
  title: string;
  description?: string | null;
  occurredAtUtc: string;
  actorUserId?: string | null;
};

export type ManagedPropertyApplicationDetailDto = {
  id: string;
  tenantId: string;
  applicationNumber: string;
  status: ManagedPropertyApplicationStatus;
  riskLevel: string;
  submittedAtUtc: string;
  reviewedAtUtc?: string | null;
  updatedAt?: string | null;
  applicant: ManagedPropertyApplicationApplicantDto;
  property: ManagedPropertyApplicationPropertyDto;
  authority: ManagedPropertyApplicationAuthorityDto;
  documents: ManagedPropertyApplicationDocumentDto[];
  systemChecks: ManagedPropertyApplicationSystemCheckDto[];
  timeline: ManagedPropertyApplicationTimelineItemDto[];
  reviewNote?: string | null;
  rejectReason?: string | null;
  applicantNote?: string | null;
  autoCreateUnitsAfterApproval: boolean;
  isActive: boolean;
};

export type ApiResponse<T> = {
  ok?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data?: T | null;
};

export type ManagedPropertyApplicationListItemDto = {
  id: string;
  applicantUserId: string;
  managedPropertyId?: string | null;
  addressId?: string | null;
  propertyName: string;
  description?: string | null;
  residentialUnitCount: number;
  commercialUnitCount: number;
  blockCount?: number | null;
  status: ManagedPropertyApplicationStatus;
  submittedAtUtc: string;
  reviewedAtUtc?: string | null;
  autoCreateUnitsAfterApproval: boolean;
  isActive: boolean;
};

export type CreateManagementApplicationConflictData = {
  existingApplicationId?: string | null;
  status?: ManagedPropertyApplicationStatus | string | null;
  propertyName?: string | null;
};

export type CreateManagementApplicationResponseData =
  | ManagedPropertyApplicationDetailDto
  | CreateManagementApplicationConflictData;

export type ManagementApplicationListStatusFilter =
  | "all"
  | "pending"
  | "underReview"
  | "approved"
  | "rejected"
  | "cancelled";

export type ManagementApplicationListViewItem = {
  id: string;
  applicationNumber: string;
  propertyName: string;
  location: string;
  status: ManagementApplicationListStatusFilter;
  applicationType: string;
  requestedRole: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  description: string;
};

export type ManagedPropertyApplicationDocumentListItemDto = {
  id: string;
  applicationId: string;
  fileDocumentId: string;
  documentType: string;
  status: string;
  isRequired: boolean;
  isSensitive: boolean;
  sortOrder: number;
  reviewNote?: string | null;
  createdAt?: string | null;
  reviewedAtUtc?: string | null;
};

export type ManagedPropertyApplicationDocumentUploadResultDto = {
  id: string;
  applicationId: string;
  fileDocumentId: string;
  fileName?: string | null;
  contentType?: string | null;
  fileSize?: number | null;
  documentType: string;
  status: string;
  isRequired: boolean;
  isSensitive: boolean;
  sortOrder: number;
  createdAt?: string | null;
};

export type UploadApplicationDocumentInput = {
  applicationId: string;
  documentType: number;
  file: File;
  isRequired: boolean;
  isSensitive: boolean;
  sortOrder: number;
};

export type ApplicationDocumentUploadProgress = {
  total: number;
  completed: number;
  failed: number;
};