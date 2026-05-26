// src/modules/users/types/UserDetail.types.ts

export type RoleSummaryDto = {
  roleId: string;
  roleName: string;
  isActive: boolean;
};

export type UserIdentityBlock = {
  id: string;
  userName: string;
  normalizedUserName: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  fullName?: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  suspensionReason?: string | null;
};

export type UserContactBlock = {
  email: string;
  phoneNumber: string;
  phoneCountryCode?: string | null;
  secondaryPhoneNumber?: string | null;
  emailForNotifications?: string | null;
  profilePhotoUrl?: string | null;
  coverPhotoUrl?: string | null;
};

export type UserVerificationBlock = {
  isEmailConfirmed: boolean;
  isPhoneConfirmed: boolean;
  isVerified: boolean;
  emailConfirmedAt?: string | null;
  phoneConfirmedAt?: string | null;
};

export type UserSecurityBlock = {
  twoFactorEnabled: boolean;
  lockoutEnabled: boolean;
  lockoutEnd?: string | null;
  accessFailedCount: number;
  lastLoginDate?: string | null;
  lastKnownIp?: string | null;
  passwordAlgorithm: string;
  hasPassword: boolean;
  externalProviders: string[];
  hasSalt: boolean;
  isAuthenticatorConfigured: boolean;
  isSuspended: boolean;
  suspensionReason?: string | null;
};

export type UserProfileBlock = {
  dateOfBirth?: string | null;
  gender?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  department?: string | null;
  professionalSummary?: string | null;
  tenantId: string;
};

export type UserPreferenceBlock = {
  cultureCode: string;
  timeZone: string;
  preferredCurrency?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;
  isPublic: boolean;
  visibilityLevel: string;
};

export type UserAuditBlock = {
  createdAt: string;
  updatedAt?: string | null;
  lastUpdatedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedByUserId?: string | null;
  deleteReason?: string | null;
  deletedBySource?: string | null;
};

export type AdminUserDetailDto = {
  identity: UserIdentityBlock;
  contact: UserContactBlock;
  verification: UserVerificationBlock;
  security: UserSecurityBlock;
  profile: UserProfileBlock;
  preferences: UserPreferenceBlock;
  audit: UserAuditBlock;
  roles: RoleSummaryDto[];
};

export type UserDetailTabKey =
  | "overview"
  | "identity"
  | "contact"
  | "preferences"
  | "organization"
  | "security"
  | "permissions"
  | "audit"
  | "system";

export type UserDetailRole =
  | "superadmin"
  | "admin"
  | "manager"
  | "auditor"
  | "staff"
  | "employee"
  | "member"
  | "user";

export type UserDetailTabDefinition = {
  key: UserDetailTabKey;
  labelKey: string;
};
