// src/app/api/v1.0/account/logout/route.ts
export const runtime = "nodejs";

/**
 * WEB Logout BFF Route
 * -----------------------------------------------------------------------------
 * Bu route, web tarafındaki logout işlemi için standart BFF giriş kapısıdır.
 *
 * Akış:
 * 1. Frontend bu route'u çağırır
 * 2. BFF, backend /api/v1.0/Account/logout endpoint'ine istek gönderir
 * 3. Ardından web auth ile ilgili cookie'leri temizler
 * 4. Frontend güvenli şekilde login ekranına yönlenebilir
 *
 * Web standardımız:
 * - auth gerçeği: cookie + BFF refresh + session/device
 * - bu yüzden logout yalnızca UI state temizliği değildir
 * - auth cookie'leri de sonlandırılmalıdır
 *
 * Not:
 * - Backend logout başarısız olsa bile cookie temizliği yapılır
 * - Çünkü web tarafında "yarım logout" kalmaması daha güvenlidir
 */

import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  fetchWithTimeout,
  newCorrelationId,
  pickClientAuth,
  resolveAcceptLanguage,
  resolveTenantKey,
} from "@/app/api/_shared/bff";

/**
 * Web tarafında temizlenecek auth/session cookie'leri.
 *
 * Not:
 * - device cookie (lm.did) bilinçli olarak silinmiyor
 * - tenant / lang / tema cookie'lerine dokunulmuyor
 */
const AUTH_COOKIE_NAMES = [
  "accessToken",
  "access_token",
  "lm_at",
  "lm.at",
  "refreshToken",
  "RefreshToken",
  "lm.rt",
  "lm.sid",
  "logged_in",
] as const;

/**
 * Request cookie'lerinden device id çöz.
 */
function resolveDeviceId(req: NextRequest): string | null {
  const value = req.cookies.get("lm.did")?.value?.trim();
  return value || null;
}

/**
 * Request cookie'lerinden refresh token çöz.
 *
 * Not:
 * Backend logout endpoint body desteklediği için elimizde varsa gönderiyoruz.
 */
function resolveRefreshToken(req: NextRequest): string | null {
  const candidates = [
    req.cookies.get("refreshToken")?.value,
    req.cookies.get("RefreshToken")?.value,
    req.cookies.get("lm.rt")?.value,
  ];

  for (const value of candidates) {
    const clean = value?.trim();
    if (clean) return clean;
  }

  return null;
}

/**
 * Response üzerine auth cookie temizliği uygular.
 */
function clearAuthCookies(response: NextResponse) {
  for (const cookieName of AUTH_COOKIE_NAMES) {
    response.cookies.set(cookieName, "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
    });

    /**
     * Bazı cookie'ler httpOnly olmayabilir.
     * Aynı isim için ikinci temizleme denemesi tarayıcı varyasyonlarını kapsar.
     */
    response.cookies.set(cookieName, "", {
      path: "/",
      expires: new Date(0),
      sameSite: "lax",
    });
  }
}

export async function POST(req: NextRequest) {
  const correlationId = newCorrelationId(req.headers);
  const { tenantKey } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req);
  const pickedAuth = pickClientAuth(req);
  const deviceId = resolveDeviceId(req);
  const refreshToken = resolveRefreshToken(req);

  /**
   * Frontend body gönderebilir; yoksa boş obje kabul ediyoruz.
   */
  const incomingBody = await req.json().catch(() => ({} as Record<string, unknown>));

  /**
   * Backend endpoint body beklediği için web standardına uygun payload üretiyoruz.
   *
   * Öncelik:
   * - frontend body'den gelen değerler
   * - yoksa request/cookie üzerinden çözülen değerler
   */
  const payload = {
    refreshToken:
      typeof incomingBody.refreshToken === "string" && incomingBody.refreshToken.trim()
        ? incomingBody.refreshToken.trim()
        : refreshToken,
    accessToken:
      typeof incomingBody.accessToken === "string" && incomingBody.accessToken.trim()
        ? incomingBody.accessToken.trim()
        : pickedAuth?.header?.replace(/^Bearer\s+/i, "") ?? null,
    logoutAllDevices:
      typeof incomingBody.logoutAllDevices === "boolean"
        ? incomingBody.logoutAllDevices
        : false,
    clientType:
      typeof incomingBody.clientType === "string" && incomingBody.clientType.trim()
        ? incomingBody.clientType.trim()
        : "Web",
    deviceId:
      typeof incomingBody.deviceId === "string" && incomingBody.deviceId.trim()
        ? incomingBody.deviceId.trim()
        : deviceId,
  };

  const upstreamUrl = buildBackendUrl("/api/v1.0/Account/logout");

  console.group("🟦 [BFF account/logout]");
  console.log("➡️ Logout başladı", {
    correlationId,
    tenantKey,
    acceptLanguage,
    hasAuth: !!pickedAuth,
    authSource: pickedAuth?.source ?? "none",
    hasRefreshToken: !!payload.refreshToken,
    hasDeviceId: !!payload.deviceId,
    logoutAllDevices: payload.logoutAllDevices,
    clientType: payload.clientType,
    upstreamUrl,
  });

  let upstreamStatus = 0;
  let upstreamPayload: unknown = null;

  try {
    const upstream = await fetchWithTimeout(
      upstreamUrl,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-correlation-id": correlationId,
          "accept-language": acceptLanguage,
          "x-tenant-key": tenantKey,
        },
        body: JSON.stringify(payload),
      },
      10_000
    );

    upstreamStatus = upstream.status;
    upstreamPayload = await upstream.json().catch(() => null);

    console.log("⬅️ Logout upstream response", {
      correlationId,
      upstreamStatus,
      ok: upstream.ok,
    });
  } catch (error) {
    console.warn("🟥 [BFF account/logout] Upstream exception", {
      correlationId,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  /**
   * Güvenlik nedeniyle cookie temizliği upstream sonucundan bağımsız uygulanır.
   * Böylece web tarafında yarım logout durumu azaltılır.
   */
  const response = NextResponse.json(
    {
      ok: true,
      status: 200,
      data: {
        logoutRequested: true,
        upstreamStatus,
        upstreamPayload,
      },
      error: null,
    },
    {
      status: 200,
      headers: {
        "x-correlation-id": correlationId,
        "x-audit-log": "logout",
      },
    }
  );

  clearAuthCookies(response);

  console.log("✅ Logout tamamlandı, auth cookie temizliği uygulandı", {
    correlationId,
    clearedCookies: AUTH_COOKIE_NAMES,
  });
  console.groupEnd();

  return response;
}