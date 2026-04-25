import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_VERSION = "1.0";

function createCorrelationId() {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function getBackendBaseUrl() {
  const raw =
    process.env.BACKEND_BASE ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE ||
    "";

  return raw.replace(/\/+$/, "");
}

function resolveTenantKey(req: NextRequest) {
  const headerTenant =
    req.headers.get("x-tenant-key") ||
    req.headers.get("tenant-key") ||
    req.headers.get("tenant");

  const cookieTenant =
    req.cookies.get("lm.tenant")?.value ||
    req.cookies.get("tenantKey")?.value;

  return headerTenant || cookieTenant || "default";
}

function resolveAcceptLanguage(req: NextRequest) {
  return (
    req.headers.get("accept-language") ||
    req.cookies.get("NEXT_LOCALE")?.value ||
    "tr"
  );
}

function resolveAuthorization(req: NextRequest) {
  const headerAuth = req.headers.get("authorization");
  if (headerAuth) return headerAuth;

  const accessToken =
    req.cookies.get("accessToken")?.value ||
    req.cookies.get("lm.at")?.value;

  if (accessToken) {
    return `Bearer ${accessToken}`;
  }

  return null;
}

export async function GET(req: NextRequest) {
  const correlationId =
    req.headers.get("x-correlation-id") || createCorrelationId();

  const backendBase = getBackendBaseUrl();
  if (!backendBase) {
    return NextResponse.json(
      {
        ok: false,
        message: "BACKEND_BASE tanımlı değil.",
        correlationId,
      },
      { status: 500 },
    );
  }

  const tenantKey = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req);
  const authorization = resolveAuthorization(req);

  const upstreamUrl = `${backendBase}/api/v${API_VERSION}/localization/manager/keys/all`;

  try {
    console.info("🟪 [BFF][LocalizationKeysAll] Request başladı", {
      correlationId,
      tenantKey,
      acceptLanguage,
      upstreamUrl,
      method: "GET",
    });

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Accept-Language": acceptLanguage,
        "x-correlation-id": correlationId,
        "x-tenant-key": tenantKey,
        "x-client-version": "lm-bff/localization-keys-all-1.0.0",
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "";

    if (!upstream.ok) {
      console.warn("⚠️ [BFF][LocalizationKeysAll] Upstream başarısız", {
        correlationId,
        tenantKey,
        status: upstream.status,
        contentType,
        body: text,
      });

      return new NextResponse(text || "", {
        status: upstream.status,
        headers: {
          "content-type": contentType || "application/json; charset=utf-8",
          "x-correlation-id": correlationId,
        },
      });
    }

    console.info("🟩 [BFF][LocalizationKeysAll] Request başarılı", {
      correlationId,
      tenantKey,
      status: upstream.status,
      contentType,
    });

    return new NextResponse(text, {
      status: 200,
      headers: {
        "content-type": contentType || "application/json; charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate",
        pragma: "no-cache",
        expires: "0",
        "x-correlation-id": correlationId,
      },
    });
  } catch (error: any) {
    console.error("💥 [BFF][LocalizationKeysAll] Exception", {
      correlationId,
      tenantKey,
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        ok: false,
        message: "UPSTREAM_NETWORK_ERROR",
        correlationId,
      },
      { status: 502 },
    );
  }
}