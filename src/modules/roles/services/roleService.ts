//src/modules/roles/services/roleService.ts
import { apiClient } from "@/utils/apiClient";
import { RoleDto, RoleUpsertDto, RolePermissionDto } from "../types";

type RoleCallCtx = {
  lang?: string;
  tenantId?: string;
};

type ApiEnvelope<T> = {
  ok?: boolean;
  message?: string;
  userMessage?: string;
  data?: T;
};

function buildHeaders(ctx?: RoleCallCtx) {
  const headers: Record<string, string> = {};

  if (ctx?.lang) headers["accept-language"] = ctx.lang;
  if (ctx?.tenantId) headers["x-tenant"] = ctx.tenantId;

  return headers;
}

function buildErrorMessage(prefix: string, payload?: ApiEnvelope<unknown>) {
  return (
    payload?.userMessage ||
    payload?.message ||
    `${prefix} sırasında beklenmeyen bir hata oluştu.`
  );
}

async function request<T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: unknown,
  ctx?: RoleCallCtx
): Promise<T> {
  const headers = buildHeaders(ctx);

  console.info(`📤 [roleService.${method}] request`, {
    url,
    lang: ctx?.lang ?? "-",
    tenantId: ctx?.tenantId ?? "-",
    hasBody: data !== undefined,
    headers,
  });

  let res: any;

  try {
    if (method === "get" || method === "delete") {
      try {
        res = await (apiClient as any)[method](url, { headers });
      } catch {
        res = await (apiClient as any)[method](url);
      }
    } else {
      try {
        res = await (apiClient as any)[method](url, data, { headers });
      } catch {
        res = await (apiClient as any)[method](url, data);
      }
    }
  } catch (err) {
    console.error(`❌ [roleService.${method}] Transport error`, {
      url,
      lang: ctx?.lang ?? "-",
      tenantId: ctx?.tenantId ?? "-",
      error: err,
    });
    throw err;
  }

  const payload = (res?.data ?? {}) as ApiEnvelope<T>;

  console.info(`📥 [roleService.${method}] response`, {
    url,
    ok: payload?.ok,
    hasData: payload?.data !== undefined,
    message: payload?.message,
    userMessage: payload?.userMessage,
  });

  if (payload?.ok) {
    return payload.data as T;
  }

  console.warn(`⚠️ [roleService.${method}] Unexpected payload`, {
    url,
    payload,
  });

  throw new Error(buildErrorMessage("Role service çağrısı", payload));
}

/**
 * 🧩 Role Service
 * ------------------------------------------------------------
 * BFF (Next.js Route Handler) üzerinden backend ile konuşur.
 * - Backend yanıtı: { ok, message, data, userMessage }
 * - Tip güvenliği, loglama ve hata yakalama içerir.
 * ------------------------------------------------------------
 */
export const roleService = {
  /**
   * 🔹 Rollerin tamamını listeler
   */
  async list(ctx?: RoleCallCtx): Promise<RoleDto[]> {
    const data = await request<RoleDto[]>("get", `/api/v1.0/roles`, undefined, ctx);

    if (!Array.isArray(data)) {
      console.warn("⚠️ [roleService.list] data array değil", { data });
      throw new Error("Rol listesi beklenen formatta değil.");
    }

    return data;
  },

  /**
   * 🔹 ID'ye göre tek bir rol getirir
   */
  async getById(id: string, ctx?: RoleCallCtx): Promise<RoleDto | null> {
    const data = await request<RoleDto | null>(
      "get",
      `/api/v1.0/roles/${id}`,
      undefined,
      ctx
    );

    return data ?? null;
  },

  /**
   * 🔹 Rol ekler veya günceller
   */
  async upsert(dto: RoleUpsertDto, ctx?: RoleCallCtx): Promise<RoleDto | null> {
    const method = dto.id ? "put" : "post";

    const data = await request<RoleDto | null>(
      method,
      `/api/v1.0/roles`,
      dto,
      ctx
    );

    return data ?? null;
  },

  /**
   * 🔹 Rol siler
   */
  async delete(id: string, ctx?: RoleCallCtx): Promise<boolean> {
    try {
      await request<unknown>("delete", `/api/v1.0/roles/${id}`, undefined, ctx);
      return true;
    } catch (err) {
      console.error(`❌ [roleService.delete] Hata: id=${id}`, err);
      return false;
    }
  },

  /**
   * 🔹 Rolün sahip olduğu izinleri getirir
   */
  async getPermissions(roleId: string, ctx?: RoleCallCtx): Promise<RolePermissionDto[]> {
    const data = await request<RolePermissionDto[]>(
      "get",
      `/api/v1.0/roles/${roleId}/permissions`,
      undefined,
      ctx
    );

    if (!Array.isArray(data)) {
      console.warn("⚠️ [roleService.getPermissions] data array değil", {
        roleId,
        data,
      });
      throw new Error("Rol izinleri beklenen formatta değil.");
    }

    return data;
  },

  /**
   * 🔹 Rolün izinlerini günceller
   */
  async updatePermissions(
    roleId: string,
    grantedKeys: string[],
    ctx?: RoleCallCtx
  ): Promise<boolean> {
    try {
      await request<unknown>(
        "put",
        `/api/v1.0/roles/${roleId}/permissions`,
        grantedKeys,
        ctx
      );
      return true;
    } catch (err) {
      console.error(`❌ [roleService.updatePermissions] Hata: roleId=${roleId}`, err);
      return false;
    }
  },
};