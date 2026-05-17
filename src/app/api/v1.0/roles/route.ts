//src/app/api/v1.0/roles/route.ts

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveTenant } from "@/lib/bff/resolveTenant";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";
const ROLES_GET_CACHE_TTL_MS = 2_000;

type RolesCacheEntry = {
  expiresAt: number;
  response: Response;
};

const rolesGetPromiseByTenant = new Map<string, Promise<Response>>();
const rolesGetCacheByTenant = new Map<string, RolesCacheEntry>();

function clearRolesGetCache() {
  rolesGetCacheByTenant.clear();
  rolesGetPromiseByTenant.clear();
}

function normalizeRoleList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      return obj.data;
    }
  }

  return [];
}

function createSuccessResponse(payload: unknown) {
  const safePayload =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    ok: typeof safePayload.ok === "boolean" ? safePayload.ok : true,
    message:
      typeof safePayload.message === "string"
        ? safePayload.message
        : "Roller başarıyla getirildi.",
    userMessage:
      typeof safePayload.userMessage === "string"
        ? safePayload.userMessage
        : "Roller başarıyla getirildi.",
    data: normalizeRoleList(payload),
  };
}

function createErrorResponse(payload: unknown) {
  const safePayload =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    ok: false,
    message:
      typeof safePayload.message === "string"
        ? safePayload.message
        : "Roller alınırken backend hatası oluştu.",
    userMessage:
      typeof safePayload.userMessage === "string"
        ? safePayload.userMessage
        : "Roller alınırken bir hata oluştu.",
    data: normalizeRoleList(safePayload.data),
  };
}

function transformRolesResponse(
  payload: unknown,
  correlationId: string,
  upstreamStatus: number
) {
  const body =
    upstreamStatus >= 200 && upstreamStatus < 300
      ? createSuccessResponse(payload)
      : createErrorResponse(payload);

  return {
    body,
    status: upstreamStatus,
    headers: {
      "x-correlation-id": correlationId,
    },
  };
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  const tenantKey = resolveTenant(req);
  const cached = rolesGetCacheByTenant.get(tenantKey);

  if (cached && cached.expiresAt > now) {
    return cached.response.clone();
  }

  const existingPromise = rolesGetPromiseByTenant.get(tenantKey);
  if (existingPromise) {
    const response = await existingPromise;
    return response.clone();
  }

  const rolesGetPromise = proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/AppRole`,
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "RolesList",
    transformResponse: (payload, context) =>
      transformRolesResponse(
        payload,
        context.correlationId,
        context.upstreamStatus
      ),
  })
    .then((response) => {
      if (response.ok) {
        rolesGetCacheByTenant.set(tenantKey, {
          expiresAt: Date.now() + ROLES_GET_CACHE_TTL_MS,
          response: response.clone(),
        });
      }

      return response;
    })
    .finally(() => {
      rolesGetPromiseByTenant.delete(tenantKey);
    });

  rolesGetPromiseByTenant.set(tenantKey, rolesGetPromise);

  const response = await rolesGetPromise;
  return response.clone();
}

export async function POST(req: NextRequest) {
  clearRolesGetCache();

  const body = await req.json();

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/AppRole`,
    method: "POST",
    body,
    timeoutMs: 15_000,
    logLabel: "RolesCreate",
    transformResponse: (payload, context) =>
      transformRolesResponse(
        payload,
        context.correlationId,
        context.upstreamStatus
      ),
  });
}

export async function PUT(req: NextRequest) {
  clearRolesGetCache();

  const body = await req.json();

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/AppRole`,
    method: "PUT",
    body,
    timeoutMs: 15_000,
    logLabel: "RolesUpdate",
    transformResponse: (payload, context) =>
      transformRolesResponse(
        payload,
        context.correlationId,
        context.upstreamStatus
      ),
  });
}

export async function DELETE(req: NextRequest) {
  clearRolesGetCache();

  const body = await req.json();

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/AppRole`,
    method: "DELETE",
    body,
    timeoutMs: 15_000,
    logLabel: "RolesDelete",
    transformResponse: (payload, context) =>
      transformRolesResponse(
        payload,
        context.correlationId,
        context.upstreamStatus
      ),
  });
}
