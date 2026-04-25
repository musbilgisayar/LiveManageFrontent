// src/app/api/v1.0/localization/manager/search/route.ts
export const runtime = "nodejs";

/**
 * Localization Manager Search BFF Route
 * -----------------------------------------------------------------------------
 * Bu route, localization manager arama işlemleri için özel BFF giriş kapısıdır.
 *
 * Neden var?
 * - Bu endpoint catch-all'a bırakıldığında auth bağlamı eksik kalabiliyor
 * - manager/search korumalı bir backend endpoint'i olduğu için özel BFF route gerekir
 *
 * Sorumluluklar:
 * - culture bilgisini query veya Accept-Language üzerinden çözmek
 * - auth / tenant / correlation id bilgilerini backend'e taşımak
 * - manager/search backend endpoint'ine güvenli şekilde proxy olmak
 * - frontend için normalize edilmiş response üretmek
 *
 * Desteklenen query parametreleri:
 * - ns
 * - contains
 * - page
 * - pageSize
 * - key
 */

import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  fetchWithTimeout,
  newCorrelationId,
  parseJsonSafe,
  pickClientAuth,
  resolveAcceptLanguage,
  resolveTenantKey,
} from "@/app/api/_shared/bff";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";
const BFF_LOG =
  process.env.LM_BFF_LOG === "1" ||
  process.env.NEXT_PUBLIC_LM_BFF_LOG === "1";

function log(...args: any[]) {
  if (!BFF_LOG) return;
  console.info(...args);
}

function warn(...args: any[]) {
  if (!BFF_LOG) return;
  console.warn(...args);
}

/**
 * Query'den culture çöz.
 *
 * Öncelik:
 * 1. culture
 * 2. lang
 * 3. Accept-Language
 */
function resolveCulture(req: NextRequest): string {
  const fromQuery =
    req.nextUrl.searchParams.get("culture")?.trim() ||
    req.nextUrl.searchParams.get("lang")?.trim();

  if (fromQuery) {
    return fromQuery;
  }

  return resolveAcceptLanguage(req);
}

/**
 * Query parametrelerini backend'e taşımak için yeni URL üretir.
 */
function buildUpstreamUrl(req: NextRequest, culture: string): string {
  const upstream = new URL(
    buildBackendUrl(`/api/v${API_VERSION}/${encodeURIComponent(culture)}/localization/manager/search`)
  );

  const passthroughKeys = ["ns", "contains", "page", "pageSize", "key"];

  for (const key of passthroughKeys) {
    const value = req.nextUrl.searchParams.get(key);
    if (value != null && value !== "") {
      upstream.searchParams.set(key, value);
    }
  }

  return upstream.toString();
}

/**
 * Backend payload'ını diziye normalize eder.
 *
 * Olası şekiller:
 * - direkt array
 * - { data: [...] }
 * - { items: [...] }
 */
function normalizeSearchResult(payload: unknown): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      return obj.data;
    }

    if (Array.isArray(obj.items)) {
      return obj.items;
    }
  }

  return [];
}

/**
 * Başarılı response üretir.
 */
function createSuccessResponse(payload: unknown) {
  const data = normalizeSearchResult(payload);

  return {
    ok: true,
    message: (payload as any)?.message ?? "Localization search başarılı.",
    userMessage:
      (payload as any)?.userMessage ?? "Çeviri arama işlemi başarılı.",
    data,
  };
}

/**
 * Hatalı response üretir.
 */
function createErrorResponse(payload: unknown) {
  return {
    ok: false,
    message:
      (payload as any)?.message ??
      "Localization search sırasında backend hatası oluştu.",
    userMessage:
      (payload as any)?.userMessage ??
      "Çeviri arama işlemi sırasında bir hata oluştu.",
    data: normalizeSearchResult((payload as any)?.data),
    error: (payload as any)?.error ?? null,
  };
}

export async function GET(req: NextRequest) {
  const correlationId = newCorrelationId(req.headers);
  const { tenantKey } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req);
  const pickedAuth = pickClientAuth(req);
  const culture = resolveCulture(req);

  const upstreamUrl = buildUpstreamUrl(req, culture);

  log("[BFF][Localization][manager/search] Request başladı", {
    correlationId,
    tenantKey,
    acceptLanguage,
    culture,
    hasAuth: !!pickedAuth,
    authSource: pickedAuth?.source ?? "none",
    upstreamUrl,
  });

  /**
   * Bu endpoint manager/search olduğu için auth beklenir.
   * Web standardına göre auth cookie/header'dan çözülemiyorsa 401 dönüyoruz.
   */
  if (!pickedAuth) {
    warn("[BFF][Localization][manager/search] Kullanıcı auth bulunamadı", {
      correlationId,
      tenantKey,
      culture,
    });

    return NextResponse.json(
      {
        ok: false,
        message: "Yetkisiz istek.",
        userMessage: "Bu işlem için oturum açmanız gerekiyor.",
        data: [],
        error: "UNAUTHORIZED",
      },
      {
        status: 401,
        headers: {
          "x-correlation-id": correlationId,
        },
      }
    );
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "x-correlation-id": correlationId,
      "Accept-Language": acceptLanguage,
      "Authorization": pickedAuth.header,
    };

    if (tenantKey) {
      headers["X-Tenant-Key"] = tenantKey;
    }

    const upstreamResponse = await fetchWithTimeout(
      upstreamUrl,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
      10_000
    );

    const payload = await parseJsonSafe(upstreamResponse);

    if (!upstreamResponse.ok) {
      warn("[BFF][Localization][manager/search] Backend hata döndü", {
        correlationId,
        status: upstreamResponse.status,
        payload,
      });

      return NextResponse.json(createErrorResponse(payload), {
        status: upstreamResponse.status,
        headers: {
          "x-correlation-id": correlationId,
        },
      });
    }

    const normalized = createSuccessResponse(payload);

    log("[BFF][Localization][manager/search] Request tamamlandı", {
      correlationId,
      status: upstreamResponse.status,
      count: normalized.data.length,
    });

    return NextResponse.json(normalized, {
      status: 200,
      headers: {
        "x-correlation-id": correlationId,
      },
    });
  } catch (error) {
    warn("[BFF][Localization][manager/search] Beklenmeyen hata", {
      correlationId,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        ok: false,
        message: "Localization manager search route sırasında beklenmeyen hata oluştu.",
        userMessage: "Çeviri arama işlemi sırasında beklenmeyen bir hata oluştu.",
        data: [],
        error: "FETCH_FAILED",
      },
      {
        status: 500,
        headers: {
          "x-correlation-id": correlationId,
        },
      }
    );
  }
}