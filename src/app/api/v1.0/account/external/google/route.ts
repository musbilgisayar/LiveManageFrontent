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
import { appendAuthCookiesFromPayload } from "@/lib/bff/authCookies";

export async function POST(req: NextRequest) {
  const correlationId = newCorrelationId(req.headers);
  const { tenantKey, source: tenantSource } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req, "tr-TR");

  try {
    const bodyText = await req.text();
    const upstreamUrl = buildBackendUrl("/api/v1.0/account/external/google");

    const upstream = await fetchWithTimeout(
      upstreamUrl,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-correlation-id": correlationId,
          "x-tenant-key": tenantKey,
          "accept-language": acceptLanguage,
          cookie: req.headers.get("cookie") ?? "",
        },
        body: bodyText,
      },
      20_000
    );

    const { data, contentType } = await readUpstreamBody(upstream);
    const responseHeaders = new Headers({
      "x-correlation-id": correlationId,
    });

    const upstreamCookieCount = appendSetCookies(upstream.headers, responseHeaders).length;
    const generatedCookieCount =
      upstreamCookieCount === 0 ? appendAuthCookiesFromPayload(data, responseHeaders) : 0;

    if (process.env.NODE_ENV !== "production") {
      console.info("[BFF GOOGLE LOGIN] Auth cookie handling", {
        correlationId,
        tenantKey,
        upstreamCookieCount,
        generatedCookieCount,
      });
    }

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
    console.error("[BFF GOOGLE LOGIN ERROR]", {
      correlationId,
      tenantKey,
      tenantSource,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        error: "BFF_GOOGLE_LOGIN_ERROR",
        correlationId,
      },
      { status: 500 }
    );
  }
}
