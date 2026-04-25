// src/app/api/v1.0/localization/manager/upsert/route.ts
export const runtime = "nodejs";

/**
 * Localization Manager Upsert BFF Route
 * -----------------------------------------------------------------------------
 * Bu route, localization manager upsert işlemleri için özel BFF giriş kapısıdır.
 *
 * Neden var?
 * - manager/upsert korumalı bir backend endpoint'idir
 * - catch-all'a bırakıldığında auth / tenant / dil bağlamı eksik kalabilir
 * - bu nedenle özel BFF route olarak ele alınmalıdır
 *
 * Sorumluluklar:
 * - culture bilgisini request body veya Accept-Language üzerinden çözmek
 * - auth / tenant / correlation id bilgilerini backend'e taşımak
 * - backend manager/upsert endpoint'ine güvenli şekilde proxy olmak
 * - frontend için normalize edilmiş response üretmek
 *
 * Not:
 * Bu route body'deki culture alanını kullanabilir.
 * Eğer body'de culture yoksa Accept-Language fallback uygulanır.
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
 * Request body içinden culture çöz.
 *
 * Öncelik:
 * 1. body.culture
 * 2. body.cultureCode
 * 3. Accept-Language
 */
function resolveCultureFromBody(
  body: Record<string, unknown> | null,
  fallbackCulture: string
): string {
  const fromBody =
    typeof body?.culture === "string" && body.culture.trim()
      ? body.culture.trim()
      : typeof body?.cultureCode === "string" && body.cultureCode.trim()
        ? body.cultureCode.trim()
        : "";

  return fromBody || fallbackCulture;
}

/**
 * Backend URL üretir.
 */
function buildUpstreamUrl(culture: string): string {
  return buildBackendUrl(
    `/api/v${API_VERSION}/${encodeURIComponent(culture)}/localization/manager/upsert`
  );
}

/**
 * Başarılı response üretir.
 */
function createSuccessResponse(payload: unknown) {
  return {
    ok: (payload as any)?.ok ?? true,
    message: (payload as any)?.message ?? "Localization upsert başarılı.",
    userMessage:
      (payload as any)?.userMessage ?? "Çeviri kaydetme işlemi başarılı.",
    data: (payload as any)?.data ?? payload ?? null,
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
      "Localization upsert sırasında backend hatası oluştu.",
    userMessage:
      (payload as any)?.userMessage ??
      "Çeviri kaydetme işlemi sırasında bir hata oluştu.",
    data: (payload as any)?.data ?? null,
    error: (payload as any)?.error ?? null,
  };
}

export async function POST(req: NextRequest) {
  const correlationId = newCorrelationId(req.headers);
  const { tenantKey } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req);
  const pickedAuth = pickClientAuth(req);

  /**
   * Bu endpoint manager/upsert olduğu için auth beklenir.
   */
  if (!pickedAuth) {
    warn("[BFF][Localization][manager/upsert] Kullanıcı auth bulunamadı", {
      correlationId,
      tenantKey,
    });

    return NextResponse.json(
      {
        ok: false,
        message: "Yetkisiz istek.",
        userMessage: "Bu işlem için oturum açmanız gerekiyor.",
        data: null,
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

  let bodyText = "";
  let bodyJson: Record<string, unknown> | null = null;

  try {
    bodyText = await req.text().catch(() => "");
    bodyJson = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    bodyJson = null;
  }

  if (!bodyJson || typeof bodyJson !== "object") {
    warn("[BFF][Localization][manager/upsert] Geçersiz request body", {
      correlationId,
    });

    return NextResponse.json(
      {
        ok: false,
        message: "Geçersiz request body.",
        userMessage: "Gönderilen veri okunamadı.",
        data: null,
        error: "INVALID_BODY",
      },
      {
        status: 400,
        headers: {
          "x-correlation-id": correlationId,
        },
      }
    );
  }

  const culture = resolveCultureFromBody(bodyJson, acceptLanguage);
  const upstreamUrl = buildUpstreamUrl(culture);

  log("[BFF][Localization][manager/upsert] Request başladı", {
    correlationId,
    tenantKey,
    acceptLanguage,
    culture,
    hasAuth: !!pickedAuth,
    authSource: pickedAuth.source,
    upstreamUrl,
    key: bodyJson.key,
  });

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
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
        method: "POST",
        headers,
        body: JSON.stringify(bodyJson),
        cache: "no-store",
      },
      10_000
    );

    const payload = await parseJsonSafe(upstreamResponse);

    if (!upstreamResponse.ok) {
      warn("[BFF][Localization][manager/upsert] Backend hata döndü", {
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

    log("[BFF][Localization][manager/upsert] Request tamamlandı", {
      correlationId,
      status: upstreamResponse.status,
      key: bodyJson.key,
    });

    return NextResponse.json(normalized, {
      status: 200,
      headers: {
        "x-correlation-id": correlationId,
      },
    });
  } catch (error) {
    warn("[BFF][Localization][manager/upsert] Beklenmeyen hata", {
      correlationId,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        ok: false,
        message: "Localization manager upsert route sırasında beklenmeyen hata oluştu.",
        userMessage: "Çeviri kaydetme işlemi sırasında beklenmeyen bir hata oluştu.",
        data: null,
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