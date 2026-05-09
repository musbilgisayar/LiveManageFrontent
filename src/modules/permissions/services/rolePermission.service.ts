// src/modules/permissions/services/rolePermission.service.ts

import {
  PERMISSION_ROLES_MOCK,
  ROLE_PERMISSION_MATRIX_MOCK,
} from "../utils/permissionMockData";

import type {
  PermissionRoleDto,
  RolePermissionMatrixDto,
} from "../types/Permission.types";

const USE_MOCK = true;

export type SyncRolePermissionsRequest = {
  roleId: string;
  permissionCodes: string[];
};

export async function getPermissionRoles(): Promise<PermissionRoleDto[]> {
  if (USE_MOCK) {
    return PERMISSION_ROLES_MOCK;
  }

  const response = await fetch("/api/v1.0/roles", {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Roles could not be loaded.");
  }

  const json = await response.json();

  return json?.data ?? json;
}

export async function getRolePermissionMatrix(
  roleId: string
): Promise<RolePermissionMatrixDto> {
  if (USE_MOCK) {
    const role =
      PERMISSION_ROLES_MOCK.find((item) => item.id === roleId) ??
      PERMISSION_ROLES_MOCK[0];

    return {
      ...ROLE_PERMISSION_MATRIX_MOCK,
      role,
    };
  }

  const response = await fetch(`/api/v1.0/roles/${roleId}/permissions`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Role permission matrix could not be loaded.");
  }

  const json = await response.json();

  return json?.data ?? json;
}

export async function syncRolePermissions(
  request: SyncRolePermissionsRequest
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  const response = await fetch(
    `/api/v1.0/roles/${request.roleId}/permissions/sync`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        permissionCodes: request.permissionCodes,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Role permissions could not be synchronized.");
  }
}