// src/modules/permissions/types/Permission.types.ts

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>
) => string;

export type PermissionScope = "self" | "tenant" | "global";

export type PermissionLevel = "1" | "2" | "3" | "4";

export type PermissionRiskLevel = "low" | "medium" | "high" | "critical";

export type PermissionRecentChangeAction =
  | "granted"
  | "revoked"
  | "synced"
  | "seeded";

export type PermissionRecentChangeTargetType =
  | "role"
  | "user"
  | "catalog";

export type PermissionDefinitionDto = {
  description?: string;
  id: string;
  code: string;
  module: string;
  action: string;
  scope: PermissionScope;
  group: string;
  level: PermissionLevel;
  descriptionKey?: string;
  fallbackDescription?: string;
  isSensitive: boolean;
  riskLevel: PermissionRiskLevel;
  isActive: boolean;
};

export type PermissionModuleSummaryDto = {
  module: string;
  displayNameKey: string;
  fallbackDisplayName: string;
  totalPermissions: number;
  sensitivePermissions: number;
  tenantScoped: number;
  selfScoped: number;
  globalScoped: number;
};

export type PermissionDashboardSummaryDto = {
  totalPermissions: number;
  activePermissions: number;
  moduleCount: number;
  sensitivePermissionCount: number;
  roleAssignmentCount: number;
  userOverrideCount: number;
  lastSeededAtUtc?: string;
};

export type PermissionRecentChangeDto = {
  id: string;
  permissionCode: string;
  action: PermissionRecentChangeAction;
  targetType: PermissionRecentChangeTargetType;
  targetName: string;
  actorName: string;
  occurredAtUtc: string;
  correlationId?: string;
};

export type PermissionDashboardDto = {
  summary: PermissionDashboardSummaryDto;
  modules: PermissionModuleSummaryDto[];
  recentChanges: PermissionRecentChangeDto[];
};

export type PermissionCatalogFilterState = {
  search: string;
  module: string;
  scope: "all" | PermissionScope;
  level: "all" | PermissionLevel;
  sensitive: "all" | "sensitive" | "normal";
};

export type PermissionCatalogDto = {
  permissions: PermissionDefinitionDto[];
  modules: PermissionModuleSummaryDto[];
};
export type PermissionRoleDto = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystemRole: boolean;
  assignedPermissionCount: number;
};

export type RolePermissionMatrixItemDto = {
  permission: PermissionDefinitionDto;
  assigned: boolean;
  inherited: boolean;
  locked: boolean;
};

export type RolePermissionMatrixDto = {
  role: PermissionRoleDto;
  permissions: RolePermissionMatrixItemDto[];
};

export type RolePermissionMatrixFilterState = {
  search: string;
  module: string;
  scope: "all" | PermissionScope;
  level: "all" | PermissionLevel;
  sensitive: "all" | "sensitive" | "normal";
  assigned: "all" | "assigned" | "unassigned";
};