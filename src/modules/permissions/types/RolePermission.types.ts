import type { PermissionDefinitionDto } from "./Permission.types";

export type PermissionRoleItem = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystemRole: boolean;
  assignedPermissionCount: number;
};

export type RolePermissionMatrixItem = {
  permission: PermissionDefinitionDto;
  assigned: boolean;
  inherited: boolean;
  locked: boolean;
};

export type RolePermissionMatrixResponse = {
  role: PermissionRoleItem;
  permissions: RolePermissionMatrixItem[];
};

export type RolePermissionSyncRequest = {
  roleId: string;
  tenantId: string;
  permissionIds: string[];
  reason?: string | null;
};

export type TenantPermissionSyncResponse = {
  success: boolean;
  syncedPermissionCount: number;
  tenantId: string;
};