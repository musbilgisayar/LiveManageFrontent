//src/app/api/v1.0/account/login/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  fetchWithTimeout,
  newCorrelationId,
  resolveAcceptLanguage,
  resolveTenantKey,
  appendSetCookies,
  readUpstreamBody,
} from "@/app/api/_shared/bff";

export async function POST(req: NextRequest) {
  const correlationId = newCorrelationId(req.headers);
  const { tenantKey, source: tenantSource } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req, "tr-TR");

  console.group("🟦 [BFF LOGIN]");

  try {
    const bodyText = await req.text();
    const upstreamUrl = buildBackendUrl("/api/v1.0/account/login");

    console.log("➡️ Login upstream isteği başlıyor", {
      correlationId,
      tenantKey,
      tenantSource,
      acceptLanguage,
      upstreamUrl,
      hasBody: !!bodyText,
    });

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
        },
        body: bodyText,
      },
      15_000
    );

    const { data, contentType } = await readUpstreamBody(upstream);

    const responseHeaders = new Headers({
      "x-correlation-id": correlationId,
    });

    appendSetCookies(upstream.headers, responseHeaders);

    console.log("⬅️ Login upstream response hazır", {
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
    console.error("🟥 [BFF LOGIN ERROR]:", {
      correlationId,
      tenantKey,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    console.groupEnd();

    return NextResponse.json(
      {
        ok: false,
        error: "BFF_LOGIN_ERROR",
        correlationId,
      },
      { status: 500 }
    );
  }
}