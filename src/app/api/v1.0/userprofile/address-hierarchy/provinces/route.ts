// src/app/api/v1.0/userprofile/address-hierarchy/provinces/route.ts

import { NextRequest, NextResponse } from "next/server";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

function getBackendBaseUrl() {
  return (
    process.env.BACKEND_URL ||
    process.env.BACKEND_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://localhost:5002"
  ).replace(/\/+$/, "");
}

function getCorrelationId(req: NextRequest) {
  return (
    req.headers.get("x-correlation-id") ||
    req.headers.get("x-request-id") ||
    crypto.randomUUID()
  );
}

function getAcceptLanguage(req: NextRequest) {
  return (
    req.headers.get("accept-language") ||
    req.cookies.get("NEXT_LOCALE")?.value ||
    "tr-TR"
  );
}

function resolveTenantKey(req: NextRequest) {
  return (
    req.headers.get("x-tenant-key")?.trim() ||
    req.cookies.get("lm.tenant")?.value?.trim() ||
    req.cookies.get("tenantKey")?.value?.trim() ||
    ""
  );
}

function buildHeaders(req: NextRequest, correlationId: string) {
  const headers = new Headers();

  headers.set("Accept", "application/json");
  headers.set("x-correlation-id", correlationId);
  headers.set("Accept-Language", getAcceptLanguage(req));
  headers.set("x-client-version", "lm-frontend/locmgr-1.0.2");

  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  const authorization = req.headers.get("authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const tenantKey = resolveTenantKey(req);
  if (tenantKey) {
    headers.set("X-Tenant-Key", tenantKey);
  }

  return headers;
}

function appendSetCookies(source: Headers, target: Headers) {
  const getSetCookieFn = (source as Headers & {
    getSetCookie?: () => string[];
  }).getSetCookie;

  if (typeof getSetCookieFn === "function") {
    const cookies = getSetCookieFn.call(source) ?? [];
    if (cookies.length > 0) {
      cookies.forEach((cookie) => target.append("set-cookie", cookie));
      return cookies.length;
    }
  }

  const single = source.get("set-cookie");
  if (single) {
    target.append("set-cookie", single);
    return 1;
  }

  return 0;
}

export async function GET(req: NextRequest) {
  const correlationId = getCorrelationId(req);

  try {
    const { searchParams } = new URL(req.url);
    const countryCode = searchParams.get("countryCode")?.trim().toUpperCase();

    console.info("[BFF][AddressHierarchy][Provinces] Request başladı", {
      correlationId,
      countryCode: countryCode || null,
    });

    if (!countryCode) {
      return NextResponse.json(
        {
          ok: false,
          message: "countryCode zorunludur.",
          userMessage: "Ülke bilgisi zorunludur.",
          data: [],
        },
        { status: 400 }
      );
    }

    const backendBaseUrl = getBackendBaseUrl();
    const backendUrl =
      `${backendBaseUrl}/api/v${API_VERSION}/profile/address-hierarchy/provinces` +
      `?countryCode=${encodeURIComponent(countryCode)}`;

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: buildHeaders(req, correlationId),
      cache: "no-store",
    });

    const rawText = await backendResponse.text();

    let payload: unknown = null;
    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch {
      payload = null;
    }

    if (!backendResponse.ok) {
      console.warn("[BFF][AddressHierarchy][Provinces] Backend hata döndü", {
        correlationId,
        status: backendResponse.status,
        countryCode,
        hasSetCookie: Boolean(backendResponse.headers.get("set-cookie")),
        rawText,
      });

      const response = NextResponse.json(
        {
          ok: false,
          message:
            (payload as { message?: string } | null)?.message ||
            "İl listesi alınırken backend hatası oluştu.",
          userMessage:
            (payload as { userMessage?: string } | null)?.userMessage ||
            "İl listesi alınırken bir hata oluştu.",
          data: Array.isArray((payload as { data?: unknown[] } | null)?.data)
            ? (payload as { data: unknown[] }).data
            : [],
        },
        { status: backendResponse.status }
      );

      response.headers.set("x-correlation-id", correlationId);
      appendSetCookies(backendResponse.headers, response.headers);

      return response;
    }

    const normalized = {
      ok: (payload as { ok?: boolean } | null)?.ok ?? true,
      message:
        (payload as { message?: string } | null)?.message ??
        "İl listesi başarıyla getirildi.",
      userMessage:
        (payload as { userMessage?: string } | null)?.userMessage ??
        "İl listesi başarıyla getirildi.",
      data: Array.isArray((payload as { data?: unknown[] } | null)?.data)
        ? (payload as { data: unknown[] }).data
        : [],
    };

    console.info("[BFF][AddressHierarchy][Provinces] Request tamamlandı", {
      correlationId,
      countryCode,
      count: normalized.data.length,
      status: backendResponse.status,
      hasSetCookie: Boolean(backendResponse.headers.get("set-cookie")),
    });

    const response = NextResponse.json(normalized, { status: 200 });
    response.headers.set("x-correlation-id", correlationId);
    appendSetCookies(backendResponse.headers, response.headers);

    return response;
  } catch (error) {
    console.error("[BFF][AddressHierarchy][Provinces] Beklenmeyen hata", {
      correlationId,
      error,
    });

    return NextResponse.json(
      {
        ok: false,
        message: "Provinces BFF route sırasında beklenmeyen hata oluştu.",
        userMessage: "İl listesi alınırken beklenmeyen bir hata oluştu.",
        data: [],
      },
      { status: 500 }
    );
  }
}