// ============================================================
// File: src/lib/bff/resolveTenant.ts
// ============================================================

import "server-only";

import {
  DEFAULT_TENANT_KEY,
  coerceTenantKey,
  isAllowedTenantKey,
  normalizeTenantKey,
} from "@/lib/tenantKeys";

export { normalizeTenantKey };

const DEFAULT_TENANT =
  process.env.LM_DEFAULT_TENANT ??
  process.env.NEXT_PUBLIC_DEFAULT_TENANT ??
  DEFAULT_TENANT_KEY;

type RequestLike = {
  headers: Headers;
};

export type TenantResolutionSource = "header" | "cookie" | "fallback(livemanage)";

export type TenantResolution = {
  tenantKey: string;
  source: TenantResolutionSource;
  fromHeader: string | null;
  fromCookie: string | null;
};

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
  const candidates = [
    normalizeTenantKey(parseCookieValue(cookieHeader, "lm.tenant")),
    normalizeTenantKey(parseCookieValue(cookieHeader, "tenantKey")),
  ].filter(Boolean);

  return candidates.find(isAllowedTenantKey) ?? candidates[0] ?? null;
}

export function resolveTenantDetailed(req: RequestLike): TenantResolution {
  const rawHeader = normalizeTenantKey(
    req.headers.get("x-tenant-key") || req.headers.get("x-tenant-id")
  );
  const fromHeader = coerceTenantKey(rawHeader, DEFAULT_TENANT);
  if (rawHeader) {
    return {
      tenantKey: fromHeader,
      source: "header",
      fromHeader,
      fromCookie: null,
    };
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const rawCookie = readTenantFromCookieHeader(cookieHeader);
  const fromCookie = coerceTenantKey(rawCookie, DEFAULT_TENANT);

  if (rawCookie) {
    return {
      tenantKey: fromCookie,
      source: "cookie",
      fromHeader: null,
      fromCookie,
    };
  }

  return {
    tenantKey: coerceTenantKey(DEFAULT_TENANT),
    source: "fallback(livemanage)",
    fromHeader: null,
    fromCookie: null,
  };
}

export function resolveTenant(req: RequestLike): string {
  return resolveTenantDetailed(req).tenantKey;
}
