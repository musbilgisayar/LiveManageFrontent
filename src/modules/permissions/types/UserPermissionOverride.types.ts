export type PermissionLevel = "1" | "2" | "3" | "4" | string;

export interface PermissionDefinitionDto {
  id?: string;
  permissionId?: string;
  permissionCode: string;
  module: string;
  action: string;
  scope: "self" | "tenant" | "global" | string;
  group?: string | null;
  level?: PermissionLevel | null;
  description?: string | null;
  displayName?: string | null;
  isActive?: boolean;
}

export interface UserPermissionDto {
  permissionId: string;
  permissionCode: string;
  grantedAt?: string | null;
  grantedById?: string | null;
  expirationDate?: string | null;
  isRevoked?: boolean;
  revokedAt?: string | null;
  revokedById?: string | null;
  revokeReason?: string | null;
}

export interface EffectivePermissionDto {
  permissionId?: string | null;
  permissionCode: string;
  module?: string | null;
  action?: string | null;
  scope?: string | null;
  source?: "Role" | "User" | "RolePermission" | "UserPermission" | string | null;
  roleNames?: string[] | null;
  isGranted?: boolean;
}

export interface UserPermissionHistoryDto {
  permissionId: string;
  permissionCode: string;
  action: "GRANT" | "REVOKE" | "REACTIVATE" | string;
  actionDate: string;
  performedById: string;
  additionalInfo?: string | null;
}

export interface AssignUserPermissionRequest {
  userId: string;
  permissionId: string;
  expirationDate?: string | null;
  reason?: string | null;
}

export interface RevokeUserPermissionRequest {
  userId: string;
  permissionId: string;
  reason?: string | null;
}

export interface RevokeAllUserPermissionsRequest {
  userId: string;
  reason?: string | null;
}

export interface UserPermissionCatalogRow {
  permissionId: string;
  permissionCode: string;
  module: string;
  action: string;
  scope: string;
  group?: string | null;
  level?: PermissionLevel | null;
  description?: string | null;
  displayName?: string | null;

  isDirect: boolean;
  isEffective: boolean;
  isRoleSource: boolean;

  roleNames: string[];

  grantedAt?: string | null;
  expirationDate?: string | null;
}

export interface UserPermissionFilters {
  search: string;
  module: string;
  scope: string;
  source: "all" | "direct" | "role" | "effective" | "missing";
  level: string;
  viewMode: "table" | "grid";
}

export interface GenericResponseDto<T = unknown> {
  success?: boolean;
  isSuccess?: boolean;
  message?: string | null;
  userMessage?: string | null;
  errorCode?: string | null;
  data?: T;
}