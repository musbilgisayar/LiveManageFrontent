// src/modules/permissions/services/rolePermission.service.ts

import type {
  PermissionRoleItem,
  RolePermissionMatrixResponse,
  RolePermissionSyncRequest,
} from "../types/RolePermission.types";

const roleCache = new Map<string, PermissionRoleItem[]>();
const matrixCache = new Map<string, RolePermissionMatrixResponse>();

function getClientAcceptLanguage(): string {
  if (typeof document === "undefined") return "tr-TR";

  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("lm.lang="))
    ?.split("=")[1];

  return cookieValue ? decodeURIComponent(cookieValue) : "tr-TR";
}

function assertTenantId(tenantId: string) {
  if (!tenantId?.trim()) {
    throw new Error("permissions:tenant.required");
  }
}

function assertRoleId(roleId: string) {
  if (!roleId?.trim()) {
    throw new Error("permissions:role.required");
  }
}

/**
 * SuperAdmin ekranlarında selectedTenantId artık x-tenant-id olarak gönderilmez.
 * Auth tenant cookie/JWT/BFF context üzerinden korunur.
 * Target tenant yalnızca URL path param olarak taşınır.
 */
function buildAuthHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "Accept-Language": getClientAcceptLanguage(),
  };
}

function buildJsonHeaders(): HeadersInit {
  return {
    ...buildAuthHeaders(),
    "Content-Type": "application/json",
  };
}

async function readJsonSafe(response: Response): Promise<any> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function ensureOk(response: Response, fallbackMessage: string): Promise<any> {
  const payload = await readJsonSafe(response);

  if (!response.ok) {
    const message =
      payload?.userMessage ||
      payload?.message ||
      payload?.error ||
      fallbackMessage;

    throw new Error(message);
  }

  return payload;
}

function unwrapData<T>(payload: any): T {
  if (payload?.data?.data !== undefined) return payload.data.data as T;
  if (payload?.data !== undefined) return payload.data as T;

  return payload as T;
}

function normalizeTenantId(tenantId: string): string {
  return tenantId.trim();
}

function roleCacheKey(tenantId: string): string {
  return normalizeTenantId(tenantId);
}

function matrixCacheKey(roleId: string, tenantId: string): string {
  return `${normalizeTenantId(tenantId)}:${roleId.trim()}`;
}

export function clearPermissionRoleCache(tenantId?: string) {
  if (!tenantId) {
    roleCache.clear();
    matrixCache.clear();
    return;
  }

  const normalizedTenantId = normalizeTenantId(tenantId);

  roleCache.delete(normalizedTenantId);

  for (const key of matrixCache.keys()) {
    if (key.startsWith(`${normalizedTenantId}:`)) {
      matrixCache.delete(key);
    }
  }
}

export async function getPermissionRoles(
  targetTenantId: string
): Promise<PermissionRoleItem[]> {
  assertTenantId(targetTenantId);

  const cacheKey = roleCacheKey(targetTenantId);
  const cached = roleCache.get(cacheKey);

  if (cached) return cached;

  const response = await fetch(
    `/api/v1.0/admin/permissions/tenants/${cacheKey}/roles`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: buildAuthHeaders(),
    }
  );

  const payload = await ensureOk(response, "permissions:roles.load.error");
  const roles = unwrapData<PermissionRoleItem[]>(payload) ?? [];

  roleCache.set(cacheKey, roles);

  return roles;
}

export async function getRolePermissionMatrix(
  roleId: string,
  targetTenantId: string
): Promise<RolePermissionMatrixResponse> {
  assertRoleId(roleId);
  assertTenantId(targetTenantId);

  const normalizedTenantId = normalizeTenantId(targetTenantId);
  const cacheKey = matrixCacheKey(roleId, normalizedTenantId);
  const cached = matrixCache.get(cacheKey);

  if (cached) return cached;

  const response = await fetch(
    `/api/v1.0/admin/permissions/tenants/${normalizedTenantId}/roles/${roleId}/matrix`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: buildAuthHeaders(),
    }
  );

  const payload = await ensureOk(response, "permissions:matrix.load.error");
  const matrix = unwrapData<RolePermissionMatrixResponse>(payload);

  matrixCache.set(cacheKey, matrix);

  return matrix;
}

export async function syncTenantPermissionCatalog(
  targetTenantId: string
): Promise<void> {
  assertTenantId(targetTenantId);

  const normalizedTenantId = normalizeTenantId(targetTenantId);

  const response = await fetch(
    `/api/v1.0/admin/permissions/tenants/${normalizedTenantId}/sync`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: buildJsonHeaders(),
    }
  );

  await ensureOk(response, "permissions:tenant.sync.error");

  clearPermissionRoleCache(normalizedTenantId);
}

export async function syncRolePermissions(
  request: RolePermissionSyncRequest
): Promise<void> {
  assertRoleId(request.roleId);
  assertTenantId(request.tenantId);

  const normalizedTenantId = normalizeTenantId(request.tenantId);

  const response = await fetch(
    `/api/v1.0/admin/permissions/tenants/${normalizedTenantId}/roles/${request.roleId}/permissions/sync`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: buildJsonHeaders(),
      body: JSON.stringify({
        permissionIds: request.permissionIds,
        reason: request.reason ?? null,
      }),
    }
  );

  await ensureOk(response, "permissions:role.sync.error");

  clearPermissionRoleCache(normalizedTenantId);
}