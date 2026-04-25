// ============================================================
// File: src/lib/bff/resolveTenant.ts
// ============================================================

import "server-only";

const DEFAULT_TENANT =
  process.env.LM_DEFAULT_TENANT ??
  process.env.NEXT_PUBLIC_DEFAULT_TENANT ??
  "default";

type RequestLike = {
  headers: Headers;
};

export type TenantResolutionSource = "header" | "cookie" | "fallback(default)";

export type TenantResolution = {
  tenantKey: string;
  source: TenantResolutionSource;
  fromHeader: string | null;
  fromCookie: string | null;
};

export function normalizeTenantKey(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function parseCookieValue(cookieHeader: string, name: string): string | null {
  const parts = cookieHeader.split(";").map((x) => x.trim());
  const hit = parts.find((x) => x.startsWith(`${name}=`));
  if (!hit) return null;

  const raw = hit.slice(name.length + 1).trim();
  if (!raw) return null;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function readTenantFromCookieHeader(cookieHeader: string): string | null {
  const lmTenant = normalizeTenantKey(parseCookieValue(cookieHeader, "lm.tenant"));
  if (lmTenant) return lmTenant;

  const tenantKey = normalizeTenantKey(parseCookieValue(cookieHeader, "tenantKey"));
  if (tenantKey) return tenantKey;

  return null;
}

export function resolveTenantDetailed(req: RequestLike): TenantResolution {
  const fromHeader = normalizeTenantKey(req.headers.get("x-tenant-key"));
  if (fromHeader) {
    return {
      tenantKey: fromHeader,
      source: "header",
      fromHeader,
      fromCookie: null,
    };
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const fromCookie = readTenantFromCookieHeader(cookieHeader);

  if (fromCookie) {
    return {
      tenantKey: fromCookie,
      source: "cookie",
      fromHeader: null,
      fromCookie,
    };
  }

  return {
    tenantKey: normalizeTenantKey(DEFAULT_TENANT) || "default",
    source: "fallback(default)",
    fromHeader: null,
    fromCookie: null,
  };
}

export function resolveTenant(req: RequestLike): string {
  return resolveTenantDetailed(req).tenantKey;
}