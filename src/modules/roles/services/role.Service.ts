// src/modules/roles/services/role.service.ts

import { apiClient } from "@/utils/apiClient";

import type {
  RoleDto,
  RolePermissionDto,
  RoleUpsertDto,
} from "../types";

type RoleCallContext = {
  lang?: string;
  tenantId?: string;
};

type ApiEnvelope<T> = {
  ok?: boolean;
  message?: string;
  userMessage?: string;
  data?: T;
};

function buildHeaders(
  ctx?: RoleCallContext,
): Record<string, string> {
  return {
    ...(ctx?.lang
      ? {
          "accept-language": ctx.lang,
        }
      : {}),

    ...(ctx?.tenantId
      ? {
          "x-tenant": ctx.tenantId,
        }
      : {}),
  };
}

function buildErrorMessage(
  fallback: string,
  payload?: ApiEnvelope<unknown>,
) {
  return (
    payload?.userMessage ||
    payload?.message ||
    fallback
  );
}

async function request<T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  body?: unknown,
  ctx?: RoleCallContext,
): Promise<T> {
  const headers = buildHeaders(ctx);

  console.info("🌐 [RoleService] Request başladı", {
    method,
    url,
    lang: ctx?.lang ?? "-",
    tenantId: ctx?.tenantId ?? "-",
  });

  const response =
    method === "get" || method === "delete"
      ? await apiClient[method](url, {
          headers,
        })
      : await apiClient[method](url, body, {
          headers,
        });

  const payload =
    (response?.data as ApiEnvelope<T>) ?? {};

  console.info("📥 [RoleService] Response alındı", {
    method,
    url,
    ok: payload.ok,
  });

  if (!payload.ok) {
    throw new Error(
      buildErrorMessage(
        "Role service işlemi başarısız.",
        payload,
      ),
    );
  }

  return payload.data as T;
}

export const roleService = {
  async list(
    ctx?: RoleCallContext,
  ): Promise<RoleDto[]> {
    const data = await request<RoleDto[]>(
      "get",
      "/api/v1.0/roles",
      undefined,
      ctx,
    );

    return Array.isArray(data) ? data : [];
  },

  async getById(
    id: string,
    ctx?: RoleCallContext,
  ): Promise<RoleDto | null> {
    const data = await request<RoleDto | null>(
      "get",
      `/api/v1.0/roles/${id}`,
      undefined,
      ctx,
    );

    return data ?? null;
  },

  async upsert(
    dto: RoleUpsertDto,
    ctx?: RoleCallContext,
  ): Promise<RoleDto | null> {
    const method = dto.id ? "put" : "post";

    const data = await request<RoleDto | null>(
      method,
      "/api/v1.0/roles",
      dto,
      ctx,
    );

    return data ?? null;
  },

  async delete(
    id: string,
    ctx?: RoleCallContext,
  ): Promise<boolean> {
    await request(
      "delete",
      `/api/v1.0/roles/${id}`,
      undefined,
      ctx,
    );

    return true;
  },

  async getPermissions(
    roleId: string,
    ctx?: RoleCallContext,
  ): Promise<RolePermissionDto[]> {
    const data = await request<
      RolePermissionDto[]
    >(
      "get",
      `/api/v1.0/roles/${roleId}/permissions`,
      undefined,
      ctx,
    );

    return Array.isArray(data) ? data : [];
  },
};