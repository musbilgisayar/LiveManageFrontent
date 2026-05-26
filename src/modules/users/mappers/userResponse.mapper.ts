//src/modules/users/mappers/userResponse.mapper.ts
import { PagedResultDto, UserListItemDto } from "../types/user.types";
import { AdminUserDetailDto } from "../types/UserDetail.types";
const str = (v: unknown) => (v == null ? "" : String(v));
const bool = (v: unknown) => Boolean(v);
const num = (v: unknown) => Number(v ?? 0);
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
//bu fonksiyon, API'den gelen yanıtın JSON formatında olup olmadığını güvenli bir şekilde kontrol eder. Eğer yanıt boşsa null döner, JSON parse işlemi sırasında bir hata oluşursa yanıt metnini içeren basit bir nesne döner. Bu sayede, API hatalarını daha kullanıcı dostu mesajlara dönüştürmek için kullanılabilir.
function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
//
function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function mapUserListItem(input: Record<string, unknown>): UserListItemDto {
  return {
    id: asString(input.id) ?? "",
    userName: asString(input.userName),
    email: asString(input.email),
    firstName: asString(input.firstName),
    lastName: asString(input.lastName),
    fullName: asString(input.fullName),
    phoneNumber: asString(input.phoneNumber),
    createdAt: asString(input.createdAt),
    updatedAt: asString(input.updatedAt),
  };
}

export function normalizeUserListResponse(input: unknown): PagedResultDto<UserListItemDto> {
  const empty: PagedResultDto<UserListItemDto> = {
    items: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  };
// bu fonksiyon, API'den gelen yanıtın farklı olası yapılarıyla başa çıkmak için tasarlanmıştır. Yanıt doğrudan bir dizi olabilir, sayfalama bilgisi içeren bir nesne olabilir veya veriler bir "data" alanında olabilir. Fonksiyon, bu farklı yapıları kontrol eder ve uygun şekilde normalize ederek tutarlı bir PagedResultDto<UserListItemDto> nesnesi döner.
  if (Array.isArray(input)) {
    return {
      ...empty,
      items: input.filter(isObject).map(mapUserListItem),
      totalCount: input.length,
      totalPages: 1,
    };
  }

  if (!isObject(input)) return empty;

  const directItems = Array.isArray(input.items) ? input.items : null;
  if (directItems) {
    const pageNumber = asNumber(input.pageNumber) ?? asNumber(input.page) ?? 1;
    const pageSize = asNumber(input.pageSize) ?? 10;
    const totalCount = asNumber(input.totalCount) ?? directItems.length;
    const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1;

    return {
      items: directItems.filter(isObject).map(mapUserListItem),
      pageNumber,
      pageSize,
      totalCount,
      totalPages,
    };
  }

  const data = isObject(input.data) ? input.data : null;
  if (data && Array.isArray(data.items)) {
    const pageNumber = asNumber(data.pageNumber) ?? asNumber(data.page) ?? 1;
    const pageSize = asNumber(data.pageSize) ?? 10;
    const totalCount = asNumber(data.totalCount) ?? data.items.length;
    const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1;

    return {
      items: data.items.filter(isObject).map(mapUserListItem),
      pageNumber,
      pageSize,
      totalCount,
      totalPages,
    };
  }

  return empty;
}
export function normalizeUserDetailResponse(input: unknown): AdminUserDetailDto | null {
  if (!isObject(input)) return null;

  const identity = isObject(input.identity) ? input.identity : {};
  const contact = isObject(input.contact) ? input.contact : {};
  const verification = isObject(input.verification) ? input.verification : {};
  const security = isObject(input.security) ? input.security : {};
  const profile = isObject(input.profile) ? input.profile : {};
  const preferences = isObject(input.preferences) ? input.preferences : {};
  const audit = isObject(input.audit) ? input.audit : {};
  const roles = Array.isArray(input.roles) ? input.roles.filter(isObject) : [];
  const nestedUser = isObject(input.user) ? input.user : {};
  const firstName = str(identity.firstName || input.firstName);
  const lastName = str(identity.lastName || input.lastName);
  const fullName =
    str(identity.fullName || input.fullName || input.displayName) ||
    [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    identity: {
      id: str(
        identity.id ||
          input.appUserId ||
          input.applicationUserId ||
          input.userId ||
          nestedUser.id ||
          nestedUser.userId ||
          nestedUser.appUserId ||
          nestedUser.applicationUserId ||
          input.id
      ),
      userName: str(identity.userName || input.userName),
      normalizedUserName: str(
        identity.normalizedUserName || input.normalizedUserName
      ),
      firstName,
      lastName,
      middleName: str(identity.middleName || input.middleName),
      fullName,
      isVerified: bool(identity.isVerified ?? input.isVerified),
      isSuspended: bool(identity.isSuspended ?? input.isSuspended),
      suspensionReason: str(identity.suspensionReason || input.suspensionReason),
    },

    contact: {
      email: str(contact.email || input.email || input.emailForNotifications),
      phoneNumber: str(contact.phoneNumber || input.phoneNumber),
      phoneCountryCode: str(contact.phoneCountryCode || input.phoneCountryCode),
      secondaryPhoneNumber: str(contact.secondaryPhoneNumber || input.secondaryPhoneNumber),
      emailForNotifications: str(contact.emailForNotifications || input.emailForNotifications),
      profilePhotoUrl: str(contact.profilePhotoUrl || input.profilePhotoUrl),
      coverPhotoUrl: str(contact.coverPhotoUrl || input.coverPhotoUrl),
    },

    verification: {
      isEmailConfirmed: bool(verification.isEmailConfirmed ?? input.isEmailConfirmed),
      isPhoneConfirmed: bool(verification.isPhoneConfirmed ?? input.isPhoneConfirmed),
      isVerified: bool(verification.isVerified ?? input.isVerified),
      emailConfirmedAt: str(verification.emailConfirmedAt || input.emailConfirmedAt),
      phoneConfirmedAt: str(verification.phoneConfirmedAt || input.phoneConfirmedAt),
    },

    security: {
      twoFactorEnabled: bool(security.twoFactorEnabled ?? input.twoFactorEnabled),
      lockoutEnabled: bool(security.lockoutEnabled ?? input.lockoutEnabled),
      lockoutEnd: str(security.lockoutEnd || input.lockoutEnd),
      accessFailedCount: num(security.accessFailedCount),
      passwordAlgorithm: str(security.passwordAlgorithm),
      hasPassword: bool(security.hasPassword),
      externalProviders: stringArray(
        security.externalProviders ??
          security.externalLoginProviders ??
          security.loginProviders ??
          input.externalProviders ??
          input.externalLoginProviders ??
          input.loginProviders
      ),
      hasSalt: bool(security.hasSalt),
      isAuthenticatorConfigured: bool(security.isAuthenticatorConfigured),
      isSuspended: bool(security.isSuspended ?? input.isSuspended),
      suspensionReason: str(security.suspensionReason || input.suspensionReason),
    },

    profile: {
      dateOfBirth: str(profile.dateOfBirth || input.dateOfBirth),
      gender: str(profile.gender || input.gender),
      jobTitle: str(profile.jobTitle || input.jobTitle),
      companyName: str(profile.companyName || input.companyName),
      department: str(profile.department || input.department),
      professionalSummary: str(profile.professionalSummary || input.professionalSummary),
      tenantId: str(profile.tenantId || input.tenantId),
    },

    preferences: {
      cultureCode: str(preferences.cultureCode || input.cultureCode),
      timeZone: str(preferences.timeZone || input.timeZone),
      preferredCurrency: str(preferences.preferredCurrency || input.preferredCurrency),
      dateFormat: str(preferences.dateFormat || input.dateFormat),
      timeFormat: str(preferences.timeFormat || input.timeFormat),
      isPublic: bool(preferences.isPublic ?? input.isPublic),
      visibilityLevel: str(preferences.visibilityLevel || input.visibilityLevel),
    },

    audit: {
      createdAt: str(audit.createdAt),
      updatedAt: str(audit.updatedAt || input.lastUpdatedAt || input.updatedAt),
      isDeleted: bool(audit.isDeleted),
    },

    roles: roles.map((role) => ({
      roleId: str(role.roleId),
      roleName: str(role.roleName),
      isActive: bool(role.isActive),
    })),
  };
}
