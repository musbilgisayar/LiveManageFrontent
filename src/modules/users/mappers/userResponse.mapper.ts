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

  return {
    identity: {
  id: str(identity.id),
  userName: str(identity.userName),
  normalizedUserName: str(identity.normalizedUserName),
  firstName: str(identity.firstName),
  lastName: str(identity.lastName),
  middleName: str(identity.middleName),
  fullName: str(identity.fullName),
  isVerified: bool(identity.isVerified),
  isSuspended: bool(identity.isSuspended),
  suspensionReason: str(identity.suspensionReason),
},

    contact: {
      email: str(contact.email),
      phoneNumber: str(contact.phoneNumber),
      phoneCountryCode: str(contact.phoneCountryCode),
    },

    verification: {
      isEmailConfirmed: bool(verification.isEmailConfirmed),
      isPhoneConfirmed: bool(verification.isPhoneConfirmed),
      isVerified: bool(verification.isVerified),
      emailConfirmedAt: str(verification.emailConfirmedAt),
    },

    security: {
      twoFactorEnabled: bool(security.twoFactorEnabled),
      lockoutEnabled: bool(security.lockoutEnabled),
      accessFailedCount: num(security.accessFailedCount),
      passwordAlgorithm: str(security.passwordAlgorithm),
      hasPassword: bool(security.hasPassword),
      hasSalt: bool(security.hasSalt),
      isAuthenticatorConfigured: bool(security.isAuthenticatorConfigured),
      isSuspended: bool(security.isSuspended),
    },

    profile: {
      gender: str(profile.gender),
      tenantId: str(profile.tenantId),
    },

    preferences: {
      cultureCode: str(preferences.cultureCode),
      timeZone: str(preferences.timeZone),
      preferredCurrency: str(preferences.preferredCurrency),
      dateFormat: str(preferences.dateFormat),
      timeFormat: str(preferences.timeFormat),
      isPublic: bool(preferences.isPublic),
      visibilityLevel: str(preferences.visibilityLevel),
    },

    audit: {
      createdAt: str(audit.createdAt),
      updatedAt: str(audit.updatedAt),
      isDeleted: bool(audit.isDeleted),
    },

    roles: roles.map((role) => ({
      roleId: str(role.roleId),
      roleName: str(role.roleName),
      isActive: bool(role.isActive),
    })),
  };
}