export type ManagementStructureType = "site" | "apartment";

export type RepresentationType =
  | "owner"
  | "proxy"
  | "board_member"
  | "professional_manager";

export type RequiredDocumentKind =
  | "signed_contract"
  | "authority_decision"
  | "power_of_attorney"
  | "assignment_letter"
  | "professional_service_agreement"
  | "other";

export type UploadedFileItem = {
  id: string;
  name: string;
  sizeLabel: string;
  kind: RequiredDocumentKind;
  description?: string;
};

export type ManagementApplicationAddressForm = {
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

export type ManagedPropertyApplicationDetailDto = {
  id: string;
  tenantId: string;
  applicantUserId: string;
  managedPropertyId?: string | null;
  propertyName: string;
  description?: string | null;
  addressId?: string | null;
  residentialUnitCount: number;
  commercialUnitCount: number;
  blockCount?: number | null;
  status: ManagedPropertyApplicationStatus;
  submittedAtUtc: string;
  reviewedAtUtc?: string | null;
  reviewedByUserId?: string | null;
  reviewNote?: string | null;
  rejectReason?: string | null;
  applicantNote?: string | null;
  autoCreateUnitsAfterApproval: boolean;
  createdAt: string;
  updatedAt?: string | null;
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