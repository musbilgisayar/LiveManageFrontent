// src/app/api/v1.0/profile/address-hierarchy/countries/route.ts
export const runtime = "nodejs";

/**
 * Address Hierarchy / Countries BFF Route
 * -----------------------------------------------------------------------------
 * Bu route, adres hiyerarşisindeki ülke listesini frontend'e sunan BFF girişidir.
 *
 * Sorumluluklar:
 * - correlation id üretmek/taşımak
 * - tenant ve dil bilgisini çözmek
 * - kullanıcı auth/cookie bilgisini backend'e forward etmek
 * - backend endpoint'ine güvenli timeout ile gitmek
 * - frontend için tutarlı response üretmek
 *
 * Not:
 * Bu route bir passthrough değildir.
 * Backend cevabını frontend için normalize eden domain bazlı bir BFF route'tur.
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
 * Backend response içinden country list'i normalize eder.
 *
 * Olası şekiller:
 * - direkt array
 * - { data: [...] }
 * - bilinmeyen durumda []
 */
function normalizeCountryList(payload: unknown): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      return obj.data;
    }
  }

  return [];
}

/**
 * Frontend'e dönecek standard response'u üretir.
 */
function createSuccessResponse(payload: unknown) {
  const data = normalizeCountryList(payload);

  return {
    ok: (payload as any)?.ok ?? true,
    message: (payload as any)?.message ?? "Ülke listesi başarıyla getirildi.",
    userMessage:
      (payload as any)?.userMessage ?? "Ülke listesi başarıyla getirildi.",
    data,
  };
}

function createErrorResponse(payload: unknown) {
  const data = normalizeCountryList((payload as any)?.data);

  return {
    ok: false,
    message:
      (payload as any)?.message ||
      "Ülke listesi alınırken backend hatası oluştu.",
    userMessage:
      (payload as any)?.userMessage ||
      "Ülke listesi alınırken bir hata oluştu.",
    data,
  };
}

export async function GET(req: NextRequest) {
  const correlationId = newCorrelationId(req.headers);
  const { tenantKey } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req);
  const pickedAuth = pickClientAuth(req);

  const backendUrl = buildBackendUrl(
    `/api/v${API_VERSION}/profile/address-hierarchy/countries`
  );

  log("[BFF][AddressHierarchy][countries] Request başladı", {
    correlationId,
    tenantKey,
    acceptLanguage,
    hasAuth: !!pickedAuth,
    authSource: pickedAuth?.source ?? "none",
    backendUrl,
  });

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "x-correlation-id": correlationId,
      "Accept-Language": acceptLanguage,
    };

    if (tenantKey) {
      headers["X-Tenant-Key"] = tenantKey;
    }

    /**
     * Web auth standardı gereği:
     * - Authorization varsa forward edilir
     * - auth cookie token olarak çözülebiliyorsa bearer forward edilir
     *
     * Not:
     * Bu route şu aşamada Cookie header'ını ham olarak forward etmiyor.
     * Eğer backend bu endpoint için ham cookie header'ına ihtiyaç duyarsa
     * bunu shared helper seviyesinde ayrıca standardize ederiz.
     */
    if (pickedAuth) {
      headers["Authorization"] = pickedAuth.header;
    }

    const backendResponse = await fetchWithTimeout(
      backendUrl,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
      10_000
    );

    const payload = await parseJsonSafe(backendResponse);

    if (!backendResponse.ok) {
      warn("[BFF][AddressHierarchy][countries] Backend hata döndü", {
        correlationId,
        status: backendResponse.status,
        payload,
      });

      return NextResponse.json(createErrorResponse(payload), {
        status: backendResponse.status,
        headers: {
          "x-correlation-id": correlationId,
        },
      });
    }

    const normalized = createSuccessResponse(payload);

    log("[BFF][AddressHierarchy][countries] Request tamamlandı", {
      correlationId,
      count: normalized.data.length,
      status: backendResponse.status,
    });

    return NextResponse.json(normalized, {
      status: 200,
      headers: {
        "x-correlation-id": correlationId,
      },
    });
  } catch (error) {
    warn("[BFF][AddressHierarchy][countries] Beklenmeyen hata", {
      correlationId,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        ok: false,
        message: "Countries BFF route sırasında beklenmeyen hata oluştu.",
        userMessage: "Ülke listesi alınırken beklenmeyen bir hata oluştu.",
        data: [],
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