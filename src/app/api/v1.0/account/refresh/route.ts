
// ============================================================
// File: src/app/api/v1.0/account/refresh/route.ts
// ============================================================

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import globalFetcher from "@/app/api/_shared/globalFetcher.server";
import { resolveTenantDetailed } from "@/lib/bff/resolveTenant";

const API_BASE =
  process.env.API_BASE || "https://localhost:5002/api/v1.0/account";

function getSetCookieCount(headers: Headers): number {
  const getSetCookieFn = (headers as any).getSetCookie;

  if (typeof getSetCookieFn === "function") {
    const cookies = getSetCookieFn.call(headers) ?? [];
    return Array.isArray(cookies) ? cookies.length : 0;
  }

  return headers.get("set-cookie") ? 1 : 0;
}

function getCookieNamesFromRequest(req: NextRequest): string[] {
  return req.cookies.getAll().map((x) => x.name);
}

export async function POST(req: NextRequest) {
  console.group("🟦 [BFF REFRESH]");

  try {
    const incomingCookieNames = getCookieNamesFromRequest(req);
    const incomingHeaderTenant = req.headers.get("x-tenant-key");
    const acceptLanguage = req.headers.get("accept-language");
    const correlationId = req.headers.get("x-correlation-id");
    const tenantResolution = resolveTenantDetailed(req);

    console.log("➡️ [BFF REFRESH] Request alındı", {
      apiBase: API_BASE,
      hasCookieHeader: !!req.headers.get("cookie"),
      incomingCookieNames,
      incomingHeaderTenant: incomingHeaderTenant ?? "(yok)",
      resolvedCookieTenant: tenantResolution.fromCookie ?? "(yok)",
      resolvedTenant: tenantResolution.tenantKey,
      tenantSource: tenantResolution.source,
      forwardedTenantHeader: tenantResolution.tenantKey,
      acceptLanguage: acceptLanguage ?? "(yok)",
      correlationId: correlationId ?? "(yok)",
    });

    const response = await globalFetcher(req, `${API_BASE}/refresh`);

    console.log("⬅️ [BFF REFRESH] globalFetcher response hazır", {
      status: response.status,
      ok: response.ok,
      requestResolvedTenant: tenantResolution.tenantKey,
      requestTenantSource: tenantResolution.source,
      responseSetCookieCount: getSetCookieCount(response.headers),
      responseCorrelationId: response.headers.get("x-correlation-id") ?? "(yok)",
    });

    console.groupEnd();
    return response;
  } catch (error) {
    console.error("🟥 [BFF REFRESH ERROR]:", error);
    console.groupEnd();

    return NextResponse.json(
      {
        ok: false,
        error: "BFF_REFRESH_ERROR",
      },
      { status: 500 }
    );
  }
}
