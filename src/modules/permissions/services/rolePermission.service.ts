// src/modules/permissions/services/rolePermission.service.ts

import type {
  PermissionRoleDto,
  RolePermissionMatrixDto,
} from "../types/Permission.types";

function getClientAcceptLanguage(): string {
  if (typeof window === "undefined") return "tr-TR";

  const locale = window.location.pathname.split("/").filter(Boolean)[0];

  const map: Record<string, string> = {
    tr: "tr-TR",
    de: "de-DE",
    en: "en-US",
    fr: "fr-FR",
    it: "it-IT",
    ar: "ar-SA",
  };

  return map[locale] ?? "tr-TR";
}
type ApiEnvelope<T> = {
  ok?: boolean;
  data?: T;
  userMessage?: string;
  message?: string;
  error?: string;
  success?: boolean;
};

export type AssignRolePermissionRequest = {
  roleId: string;
  permissionId: string;
  additionalInfo?: string;
};

export type RevokeRolePermissionRequest = {
  roleId: string;
  permissionId: string;
  reason?: string;
};

export type SyncRolePermissionsRequest = {
  roleId: string;
  permissionIds: string[];
  reason?: string;
};

function unwrapApiData<T>(json: ApiEnvelope<T> | T): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiEnvelope<T>).data as T;
  }

  return json as T;
}

async function ensureOk(response: Response, fallbackMessageKey: string) {
  const json = await response.json().catch(() => null);

  if (!response.ok || json?.ok === false) {
    throw new Error(
      json?.userMessage ||
        json?.message ||
        json?.error ||
        fallbackMessageKey
    );
  }

  return json;
}

function mapRole(raw: any): PermissionRoleDto {
  return {
    id: raw.id,
    name: raw.name,
    displayName: raw.name,
    description: raw.description ?? "",
    isSystemRole: raw.isSystem ?? false,
    assignedPermissionCount: raw.permissions?.length ?? 0,
  };
}

let permissionRolesPromise: Promise<PermissionRoleDto[]> | null = null;
let permissionRolesCache: PermissionRoleDto[] | null = null;

export async function getPermissionRoles(): Promise<PermissionRoleDto[]> {
  if (permissionRolesCache) {
    return permissionRolesCache;
  }

  if (permissionRolesPromise) {
    return permissionRolesPromise;
  }

  permissionRolesPromise = (async () => {
    const response = await fetch("/api/v1.0/roles", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
     headers: {
  Accept: "application/json",
  "Accept-Language": getClientAcceptLanguage(),
},
    });

    const json = await ensureOk(response, "permissions:role.list.loadError");

    const raw = unwrapApiData<any[]>(json);
    const mapped = (raw ?? []).map(mapRole);

    permissionRolesCache = mapped;

    return mapped;
  })().finally(() => {
    permissionRolesPromise = null;
  });

  return permissionRolesPromise;
}

export async function getRolePermissionMatrix(
  roleId: string
): Promise<RolePermissionMatrixDto> {
  const response = await fetch(
    `/api/v1.0/role-permissions/${roleId}/matrix`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Accept-Language": getClientAcceptLanguage(),
      },
    }
  );

  const json = await ensureOk(response, "permissions:role.matrix.loadError");

  const raw = unwrapApiData<any>(json);

  return {
    role: {
      id: raw.roleId,
      name: raw.roleName,
      displayName: raw.roleName,
      description: "",
      isSystemRole: raw.isSystemRole,
      assignedPermissionCount:
        raw.permissions?.filter((x: any) => x.assigned).length ?? 0,
    },
    permissions: (raw.permissions ?? []).map((item: any) => ({
      permission: {
        id: item.permissionId,
        code: item.permissionCode,
        module: item.module,
        action: item.action,
        scope: item.scope,
        group: item.group,
        level: item.level,
        descriptionKey: item.descriptionKey,
        description: item.description,
        fallbackDescription: item.description,
        isSensitive: item.isSensitive,
        riskLevel:
          item.level === "4"
            ? "critical"
            : item.level === "3"
              ? "high"
              : "medium",
        isActive: true,
      },
      assigned: item.assigned,
      inherited: item.inherited,
      locked: item.locked,
    })),
  };
}

export async function assignRolePermission(
  request: AssignRolePermissionRequest
): Promise<void> {
  const response = await fetch("/api/v1.0/role-permissions/assign", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roleId: request.roleId,
      permissionId: request.permissionId,
      additionalInfo: request.additionalInfo ?? null,
    }),
  });

  await ensureOk(response, "permissions:role.assign.error");
}

export async function revokeRolePermission(
  request: RevokeRolePermissionRequest
): Promise<void> {
  const response = await fetch("/api/v1.0/role-permissions/revoke", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roleId: request.roleId,
      permissionId: request.permissionId,
      reason: request.reason ?? null,
    }),
  });

  await ensureOk(response, "permissions:role.revoke.error");
}

export async function syncRolePermissions(
  request: SyncRolePermissionsRequest
): Promise<void> {
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
        permissionIds: request.permissionIds,
        reason: request.reason ?? "permissions:role.sync.reason.default",
      }),
    }
  );

  await ensureOk(response, "permissions:role.sync.error");
}