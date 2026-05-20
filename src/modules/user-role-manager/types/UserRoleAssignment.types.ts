//src/modules/user-role-manager/types/UserRoleAssignment.types.ts
import type { GenericResponseDto } from "./RoleManager.types";

export type AppUserRoleDto = {
  roleId: string;

  roleName: string;

  assignedAt: string;
};

export type AppUserRoleHistoryDto = {
  roleId: string;

  roleName: string;

  assignedAt: string;

  isRevoked: boolean;

  revokedAt: string | null;

  revokeReason: string | null;
};

export type UserRoleChangeReasonDto = {
  reason?: string | null;
};

export type UserRoleSyncRequestDto = {
  roleIds: string[];

  reason?: string | null;
};

export type UserRoleOperationResponse =
  GenericResponseDto<string>;

export type UserActiveRolesResponse =
  AppUserRoleDto[];

export type UserRoleHistoryResponse =
  AppUserRoleHistoryDto[];

export type AssignRolePayload = {
  userId: string;

  roleId: string;

  reason?: string | null;
};

export type RevokeRolePayload = {
  userId: string;

  roleId: string;

  reason?: string | null;
};

export type SyncRolesPayload = {
  userId: string;

  roleIds: string[];

  reason?: string | null;
};

export type RevokeAllRolesPayload = {
  userId: string;

  reason?: string | null;
};

export type UserRoleAssignmentDialogMode =
  | "assign"
  | "sync"
  | "revoke";

export type UserRoleHistoryItem = {
  roleId: string;

  roleName: string;

  assignedAt: string;

  revokedAt: string | null;

  revokeReason: string | null;

  isRevoked: boolean;
};