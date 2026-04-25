//src/app/api/v1.0/userprofile/address-hierarchy/districts/route.ts
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

export async function GET(req: NextRequest) {
  const correlationId = getCorrelationId(req);

  try {
    const { searchParams } = new URL(req.url);
    const provinceId = searchParams.get("provinceId")?.trim();

    console.info("[BFF][AddressHierarchy][districts] Request başladı", {
      correlationId,
      provinceId: provinceId || null,
    });

    if (!provinceId) {
      console.warn("[BFF][AddressHierarchy][districts] provinceId eksik", {
        correlationId,
      });

      return NextResponse.json(
        {
          ok: false,
          message: "provinceId zorunludur.",
          userMessage: "İl bilgisi zorunludur.",
          data: [],
        },
        { status: 400 }
      );
    }

    const backendBaseUrl = getBackendBaseUrl();
    const backendUrl =
      `${backendBaseUrl}/api/v${API_VERSION}/profile/address-hierarchy/districts` +
      `?provinceId=${encodeURIComponent(provinceId)}`;

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: buildHeaders(req, correlationId),
      cache: "no-store",
    });

    const rawText = await backendResponse.text();

    let payload: any = null;
    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch {
      payload = null;
    }

    if (!backendResponse.ok) {
      console.warn("[BFF][AddressHierarchy][districts] Backend hata döndü", {
        correlationId,
        status: backendResponse.status,
        provinceId,
        rawText,
      });

      return NextResponse.json(
        {
          ok: false,
          message:
            payload?.message || "İlçe listesi alınırken backend hatası oluştu.",
          userMessage:
            payload?.userMessage ||
            "İlçe listesi alınırken bir hata oluştu.",
          data: Array.isArray(payload?.data) ? payload.data : [],
        },
        { status: backendResponse.status }
      );
    }

    const normalized = {
      ok: payload?.ok ?? true,
      message: payload?.message ?? "İlçe listesi başarıyla getirildi.",
      userMessage:
        payload?.userMessage ?? "İlçe listesi başarıyla getirildi.",
      data: Array.isArray(payload?.data) ? payload.data : [],
    };

    console.info("[BFF][AddressHierarchy][districts] Request tamamlandı", {
      correlationId,
      provinceId,
      count: normalized.data.length,
      status: backendResponse.status,
    });

    return NextResponse.json(normalized, {
      status: 200,
    });
  } catch (error) {
    console.error("[BFF][AddressHierarchy][districts] Beklenmeyen hata", {
      correlationId,
      error,
    });

    return NextResponse.json(
      {
        ok: false,
        message: "District BFF route sırasında beklenmeyen hata oluştu.",
        userMessage: "İlçe listesi alınırken beklenmeyen bir hata oluştu.",
        data: [],
      },
      { status: 500 }
    );
  }
}