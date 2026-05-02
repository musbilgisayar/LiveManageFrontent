export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveTenantDetailed } from "@/lib/bff/resolveTenant";
import {
  buildWebAuthHeaders,
  extractSetCookies,
  filterProxyResponseHeaders,
  isAbortLikeError,
  resolveBackendUrl,
  resolveCorrelationId,
  withTimeout,
} from "@/lib/bff/webAuthProxyCore";

const REFRESH_TIMEOUT_MS = 10_000;

function getCookieNamesFromRequest(req: NextRequest): string[] {
  return req.cookies.getAll().map((item) => item.name);
}

export async function POST(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);
  const tenantResolution = resolveTenantDetailed(req);
  const upstreamUrl = resolveBackendUrl("/api/v1.0/account/refresh");

  if (process.env.NODE_ENV !== "production") {
    console.group("🟦 [BFF REFRESH]");
    console.info("➡️ [BFF REFRESH] Request alındı", {
      upstreamUrl,
      hasCookieHeader: !!req.headers.get("cookie"),
      incomingCookieNames: getCookieNamesFromRequest(req),
      incomingHeaderTenant: req.headers.get("x-tenant-key") ?? "(yok)",
      resolvedCookieTenant: tenantResolution.fromCookie ?? "(yok)",
      resolvedTenant: tenantResolution.tenantKey,
      tenantSource: tenantResolution.source,
      acceptLanguage: req.headers.get("accept-language") ?? "(yok)",
      correlationId,
    });
  }

  const headers = buildWebAuthHeaders(req, correlationId, {
    defaultAccept: "application/json",
    includeAuthorization: false,
  });

  const { signal, cleanup } = withTimeout(REFRESH_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      cache: "no-store",
      signal,
    });

    const responseHeaders = filterProxyResponseHeaders(upstream, []);
    const responseText = await upstream.text();
    const setCookies = extractSetCookies(upstream.headers);

    if (process.env.NODE_ENV !== "production") {
      console.info("⬅️ [BFF REFRESH] Upstream response hazır", {
        status: upstream.status,
        ok: upstream.ok,
        requestResolvedTenant: tenantResolution.tenantKey,
        requestTenantSource: tenantResolution.source,
        responseSetCookieCount: setCookies.length,
        responseSetCookieNames: setCookies.map((cookie) => cookie.split("=")[0]),
        responseCorrelationId:
          responseHeaders.get("x-correlation-id") ?? "(yok)",
      });
      console.groupEnd();
    }

    if (upstream.status === 204 || upstream.status === 205 || !responseText) {
      return new NextResponse(null, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    const contentType =
      responseHeaders.get("content-type") ||
      upstream.headers.get("content-type") ||
      "application/json; charset=utf-8";

    if (!responseHeaders.has("content-type")) {
      responseHeaders.set("content-type", contentType);
    }

    return new NextResponse(responseText, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.error("🟥 [BFF REFRESH ERROR]", {
        correlationId,
        upstreamUrl,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.groupEnd();
    }

    const isTimeout = isAbortLikeError(error);

    return NextResponse.json(
      {
        ok: false,
        error: isTimeout ? "BFF_REFRESH_TIMEOUT" : "BFF_REFRESH_ERROR",
        correlationId,
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    cleanup();
  }
}