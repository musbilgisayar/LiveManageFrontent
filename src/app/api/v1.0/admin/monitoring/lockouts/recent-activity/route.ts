//src/app/api/v1.0/admin/monitoring/lockouts/recent-activity/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  appendSetCookies,
  buildBackendUrl,
  fetchWithTimeout,
  newCorrelationId,
  readUpstreamBody,
  resolveAcceptLanguage,
  resolveTenantKey,
} from "@/app/api/_shared/bff";

export async function GET(req: NextRequest) {
  const correlationId = newCorrelationId(req.headers);
  const { tenantKey, source: tenantSource } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req, "tr-TR");

  console.group("🟦 [BFF LOCKOUT RECENT ACTIVITY]");

  try {
    const queryString = req.nextUrl.searchParams.toString();

    const upstreamPath = queryString
      ? `/api/v1.0/admin/monitoring/lockouts/recent-activity?${queryString}`
      : "/api/v1.0/admin/monitoring/lockouts/recent-activity";

    const upstreamUrl = buildBackendUrl(upstreamPath);

    console.log("➡️ Lockout recent activity upstream isteği başlıyor", {
      correlationId,
      tenantKey,
      tenantSource,
      acceptLanguage,
      upstreamUrl,
      queryString,
    });

    const upstream = await fetchWithTimeout(
      upstreamUrl,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          accept: "application/json",
          "x-correlation-id": correlationId,
          "x-tenant-key": tenantKey,
          "accept-language": acceptLanguage,
          cookie: req.headers.get("cookie") ?? "",
        },
      },
      15_000
    );

    const { data, contentType } = await readUpstreamBody(upstream);

    const responseHeaders = new Headers({
      "x-correlation-id": correlationId,
    });

    appendSetCookies(upstream.headers, responseHeaders);

    console.log("⬅️ Lockout recent activity upstream response hazır", {
      correlationId,
      tenantKey,
      tenantSource,
      status: upstream.status,
      ok: upstream.ok,
      contentType,
    });

    console.groupEnd();

    if (contentType.includes("application/json")) {
      return NextResponse.json(data, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    return new NextResponse(typeof data === "string" ? data : null, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("🟥 [BFF LOCKOUT RECENT ACTIVITY ERROR]:", {
      correlationId,
      tenantKey,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    console.groupEnd();

    return NextResponse.json(
      {
        ok: false,
        error: "BFF_LOCKOUT_RECENT_ACTIVITY_ERROR",
        correlationId,
      },
      { status: 500 }
    );
  }
}