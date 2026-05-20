//src/modules/user-role-manager/types/RoleManager.types.ts
export type GenericResponseDto<T = unknown> = {
  ok: boolean;
  message: string;
  userMessage?: string | null;
  data: T | null;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type RoleManagerSummaryDto = {
  totalUsers: number;
  usersWithActiveRole: number;
  usersWithoutActiveRole: number;
  totalRoles: number;
  activeRoles: number;
  sensitiveRoles: number;
  recentRoleChanges: number;
};

export type RoleDistributionDto = {
  roleId: string;
  roleName: string | null;
  description: string | null;
  category: string;
  isSensitive: boolean;
  activeUserCount: number;
  lastAssignedAt: string | null;
};

export type RoleManagerUserQueryDto = {
  tenantId?: string | null;
  allTenants?: boolean;
  pageNumber?: number;
  pageSize?: number;
  search?: string | null;
  isVerified?: boolean | null;
  isSuspended?: boolean | null;
  roleId?: string | null;
  hasActiveRole?: boolean | null;
};

export type RoleManagerUserListItemDto = {
  userId: string;
  tenantId: string;
  userName: string | null;
  emailMasked: string;
  fullName: string;
  isVerified: boolean;
  isSuspended: boolean;
  activeRoleId: string | null;
  activeRoleName: string | null;
  activeRoleAssignedAt: string | null;
  lastRoleChangedAt: string | null;
};

export type RoleManagerScopeMode =
  | "currentTenant"
  | "allTenants"
  | "specificTenant";

export type RoleManagerScopeState = {
  mode: RoleManagerScopeMode;
  tenantId: string | null;
};

export type RoleManagerUserFilters = {
  search: string;
  isVerified: boolean | null;
  isSuspended: boolean | null;
  roleId: string | null;
  hasActiveRole: boolean | null;
};

export type RoleManagerUsersResponse =
  GenericResponseDto<PagedResult<RoleManagerUserListItemDto>>;

export type RoleManagerSummaryResponse =
  GenericResponseDto<RoleManagerSummaryDto>;

export type RoleDistributionResponse =
  GenericResponseDto<RoleDistributionDto[]>;