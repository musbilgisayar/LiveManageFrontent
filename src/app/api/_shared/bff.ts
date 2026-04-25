// src/app/api/_shared/bff.ts
export const runtime = "nodejs";

/**
 * BFF Shared Core
 * --------------------------------------------------------------------------
 * Bu dosya, Next.js BFF route'larının ortak çekirdeği olarak kullanılır.
 *
 * Hedef:
 * - route'larda tekrar eden yardımcı mantıkları merkezileştirmek
 * - web auth / tenant / dil / upstream fetch davranışını standardize etmek
 * - route'ları tek tek "kopya mantık" ile yazmak yerine aynı omurgaya bağlamak
 *
 * Bu çekirdek özellikle WEB tarafı için şu kabullere göre hazırlanmıştır:
 * - Web auth gerçeği: cookie + BFF refresh + session/device akışı
 * - i18n ana/public giriş: /api/i18n/[lang]/dict
 *
 * Not:
 * Bu dosya tek başına tüm route davranışını belirlemez.
 * Ancak route'ların ortak bağımlılığı olacak yardımcı katmanı sağlar.
 */

import crypto from "node:crypto";
import { Agent, setGlobalDispatcher } from "undici";
import { NextRequest } from "next/server";
import { resolveTenant } from "@/lib/bff/resolveTenant";
/* -------------------------------------------------------------------------- */
/* ENV / RUNTIME                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Backend base adresi.
 *
 * Tek merkezden çözülmesi amaçlanır.
 * Route dosyalarında ayrıca BACKEND tanımlamak yerine bu sabit kullanılmalıdır.
 */
export const BACKEND_BASE =
  process.env.BACKEND_BASE ||
  process.env.BACKEND_URL ||
  process.env.BACKEND_BASE_URL ||
  process.env.LM_BACKEND_BASE ||
  "https://localhost:5002";

/**
 * Servisler arası çağrılarda kullanılabilecek service token.
 *
 * Not:
 * Bu token web kullanıcı auth'ının yerine geçmez.
 * Kullanım alanı daha çok:
 * - i18n/service-to-service çağrıları
 * - sistem içi özel backend erişimleri
 */
export const SERVICE_JWT =
  process.env.SVC_JWT ||
  process.env.SERVICE_JWT ||
  process.env.SERVICE_TOKEN ||
  "";


  /**
 * Service token erişimi.
 *
 * Not:
 * Bazı route'lar sabit yerine fonksiyon import ediyor.
 * Bu yüzden shared core içinde bu yardımcı da bulunmalı.
 */
export async function getServiceToken(): Promise<string> {
  return SERVICE_JWT;
}
 
const isDev = process.env.NODE_ENV !== "production";
const allowInsecure = process.env.BE_SSL_INSECURE === "true";

let dispatcherReady = false;

function ensureDevDispatcher() {
  if (dispatcherReady) return;
  if (!isDev || !allowInsecure) return;

  const insecureAgent = new Agent({
    connect: { rejectUnauthorized: false },
  });

  setGlobalDispatcher(insecureAgent);
  dispatcherReady = true;
}

/* -------------------------------------------------------------------------- */
/* CORRELATION / REQUEST ID                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Gelen request header'ında correlation id varsa onu kullanır,
 * yoksa yeni bir correlation id üretir.
 */
export function newCorrelationId(h?: Headers): string {
  return h?.get("x-correlation-id") ?? crypto.randomUUID();
}

/* -------------------------------------------------------------------------- */
/* LANGUAGE                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Şu anda aktif olarak kabul edilen kısa dil kodları.
 *
 * Not:
 * Projede daha fazla dil gerçekten aktifse bu liste genişletilmelidir.
 */
const SUPPORTED_LANGS = new Set(["tr", "en", "de", "fr", "it", "ar"]);

/**
 * Kısa dil kodundan culture üretir.
 */
function cultureFromShort(short: string): string {
  switch (short) {
    case "tr":
      return "tr-TR";
    case "en":
      return "en-US";
    case "de":
      return "de-DE";
    case "fr":
      return "fr-FR";
    case "it":
      return "it-IT";
    case "ar":
      return "ar-SA";
    default:
      return "tr-TR";
  }
}

/**
 * Dışarıdan gelen dil değerini normalize eder.
 *
 * Örnek:
 * - tr      -> { short: "tr", culture: "tr-TR" }
 * - tr-TR   -> { short: "tr", culture: "tr-TR" }
 * - de-DE   -> { short: "de", culture: "de-DE" }
 * - bilinmeyen -> tr fallback
 */
export function normalizeLang(raw?: string) {
  const value = (raw || "tr").trim().toLowerCase();
  const short = value.split("-")[0];
  const norm = SUPPORTED_LANGS.has(short) ? short : "tr";

  return {
    short: norm,
    culture: cultureFromShort(norm),
  };
}

/**
 * Request'ten gelen accept-language değerini çözmeye çalışır.
 *
 * Sıra:
 * 1. lm.lang cookie
 * 2. NEXT_LOCALE cookie
 * 3. accept-language header
 * 4. fallback
 */
export function resolveAcceptLanguage(
  req: NextRequest | Request,
  fallback = "tr-TR"
): string {
  if ("cookies" in req) {
    const fromLmLang = req.cookies.get("lm.lang")?.value?.trim();
    if (fromLmLang) {
      return fromLmLang.includes("-")
        ? fromLmLang
        : normalizeLang(fromLmLang).culture;
    }

    const fromNextLocale = req.cookies.get("NEXT_LOCALE")?.value?.trim();
    if (fromNextLocale) {
      return fromNextLocale.includes("-")
        ? fromNextLocale
        : normalizeLang(fromNextLocale).culture;
    }
  }

  const fromHeader = req.headers.get("accept-language")?.split(",")[0]?.trim();
  if (fromHeader) {
    return fromHeader;
  }

  return fallback;
}

/**
 * Accept-Language içinden kısa locale segmenti üretir.
 *
 * Örnek:
 * - tr-TR -> tr
 * - de-DE -> de
 */
export function resolveLangSegment(
  req: NextRequest | Request,
  fallback = "tr"
): string {
  const acceptLanguage = resolveAcceptLanguage(req, fallback);
  return normalizeLang(acceptLanguage).short;
}

/* -------------------------------------------------------------------------- */
/* TENANT                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Varsayılan tenant key.
 */
export const DEFAULT_TENANT =
  process.env.LM_DEFAULT_TENANT ||
  process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
  "default";

/**
 * Request'ten tenant key çözer.
 *
 * Sıra:
 * 1. x-tenant-key header
 * 2. lm.tenant cookie
 * 3. tenantKey cookie
 * 4. fallback default tenant
 */
 export function resolveTenantKey(
  req: NextRequest | Request
): {
  tenantKey: string;
  source: "header" | "cookie" | "fallback(bff)";
} {
  if ("cookies" in req) {
    const fromCookie =
      req.cookies.get("lm.tenant")?.value?.trim() ||
      req.cookies.get("tenantKey")?.value?.trim();

    if (fromCookie) {
      return { tenantKey: fromCookie, source: "cookie" };
    }
  }

  const fromHeader = req.headers.get("x-tenant-key")?.trim();
  if (fromHeader) {
    return { tenantKey: fromHeader, source: "header" };
  }

  const resolved = resolveTenant(req as NextRequest);
  return {
    tenantKey: resolved || DEFAULT_TENANT,
    source: "fallback(bff)",
  };
}

/* -------------------------------------------------------------------------- */
/* AUTH                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Web tarafında kullanıcı auth sinyalini request'ten seçer.
 *
 * Öncelik:
 * 1. Authorization header (Bearer ...)
 * 2. accessToken cookie
 * 3. access_token cookie
 * 4. lm_at cookie
 * 5. lm.at cookie
 *
 * Not:
 * Bu helper kullanıcı auth sinyalini seçer.
 * Service token ile karıştırılmamalıdır.
 */
export function pickClientAuth(
  req: NextRequest | Request
): { header: string; source: string } | null {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization") || "";

  if (authHeader.trim().toLowerCase().startsWith("bearer ")) {
    return {
      header: authHeader.trim(),
      source: "client-header",
    };
  }

  if ("cookies" in req) {
    const cookieCandidates: Array<{ name: string; source: string }> = [
      { name: "accessToken", source: "cookie-accessToken" },
      { name: "access_token", source: "cookie-access_token" },
      { name: "lm_at", source: "cookie-lm_at" },
      { name: "lm.at", source: "cookie-lm.at" },
    ];

    for (const candidate of cookieCandidates) {
      const token = req.cookies.get(candidate.name)?.value?.trim();
      if (token) {
        return {
          header: `Bearer ${token}`,
          source: candidate.source,
        };
      }
    }
  }

  return null;
}

/**
 * Auth header'ı için kısa ve güvenli cache anahtarı üretir.
 */
export function authHash(authHeader?: string | null): string {
  const normalized = (authHeader ?? "").trim();
  if (!normalized) {
    return "noauth";
  }

  return crypto
    .createHash("sha1")
    .update(normalized)
    .digest("hex")
    .slice(0, 12);
}

/* -------------------------------------------------------------------------- */
/* FETCH / TIMEOUT                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Ortak timeout'lu fetch helper.
 *
 * Özellikler:
 * - dev SSL dispatcher'ı gerektiğinde hazırlar
 * - AbortController ile timeout uygular
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  ms = 10_000
): Promise<Response> {
  ensureDevDispatcher();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);

  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------------------------------------------------------------- */
/* UPSTREAM BODY / JSON SAFE                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Response body'yi güvenli biçimde parse eder.
 *
 * Davranış:
 * - JSON ise parse etmeye çalışır
 * - parse edemezse null/json fallback döner
 * - text ise string döner
 */
export async function readUpstreamBody(
  upstream: Response
): Promise<{
  data: unknown;
  contentType: string;
}> {
  const contentType = upstream.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const json = await upstream.json();
      return { data: json, contentType };
    } catch {
      return { data: null, contentType };
    }
  }

  try {
    const text = await upstream.text();
    return { data: text, contentType };
  } catch {
    return { data: "", contentType };
  }
}

/**
 * Response text'ini güvenli JSON parse etmeye çalışır.
 * Parse edemezse raw text bilgisini döner.
 */
export async function parseJsonSafe(
  response: Response
): Promise<Record<string, unknown> | null> {
  const text = await response.text().catch(() => "");

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/* -------------------------------------------------------------------------- */
/* SET-COOKIE                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Upstream'den gelen Set-Cookie başlıklarını BFF host'una daha uygun hale getirir.
 *
 * Özellikle:
 * - upstream Domain kaldırılır
 * - development ortamında Secure zorunluluğu gevşetilebilir
 */
export function normalizeSetCookieForBff(cookie: string): string {
  let normalized = cookie;

  normalized = normalized.replace(/;\s*Domain=[^;]+/i, "");

  if (process.env.NODE_ENV === "development") {
    normalized = normalized.replace(/;\s*Secure/gi, "");
  }

  return normalized;
}

/**
 * Upstream response headers içindeki Set-Cookie başlıklarını hedef header'a taşır.
 *
 * Dönüş değeri:
 * - forward edilen normalize cookie listesi
 */
export function appendSetCookies(source: Headers, target: Headers): string[] {
  const getSetCookieFn = (source as any).getSetCookie;

  if (typeof getSetCookieFn === "function") {
    const cookies: string[] = getSetCookieFn.call(source) ?? [];
    if (cookies.length > 0) {
      const normalizedCookies = cookies.map(normalizeSetCookieForBff);
      normalizedCookies.forEach((cookie) => target.append("set-cookie", cookie));
      return normalizedCookies;
    }
  }

  const single = source.get("set-cookie");
  if (single) {
    const normalized = normalizeSetCookieForBff(single);
    target.append("set-cookie", normalized);
    return [normalized];
  }

  return [];
}

/* -------------------------------------------------------------------------- */
/* CACHE                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Hafif process-local memory cache.
 *
 * Notlar:
 * - instance bazlıdır
 * - dağıtık garanti vermez
 * - çok kritik tutarlılık gereken veriler için tek kaynak sayılmaz
 * - kısa TTL'li BFF optimizasyonu için uygundur
 */
const mem = new Map<string, { exp: number; val: unknown }>();

/**
 * Cache'den veri okur.
 * Süresi geçmişse cache kaydını temizler.
 */
export function cacheGet<T>(key: string): T | null {
  const hit = mem.get(key);
  if (!hit || hit.exp < Date.now()) {
    mem.delete(key);
    return null;
  }

  return hit.val as T;
}

/**
 * Cache'e veri yazar.
 *
 * seconds <= 0 ise kayıt silinir.
 */
export function cacheSet(key: string, val: unknown, seconds = 30): void {
  if (seconds <= 0) {
    mem.delete(key);
    return;
  }

  mem.set(key, {
    exp: Date.now() + seconds * 1000,
    val,
  });
}

/**
 * Cache kaydını açıkça siler.
 */
export function cacheDelete(key: string): void {
  mem.delete(key);
}

/* -------------------------------------------------------------------------- */
/* OPTIONAL HELPERS                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Backend URL'yi güvenli şekilde birleştirir.
 *
 * Örnek:
 * buildBackendUrl("/api/v1.0/account/me")
 */
export function buildBackendUrl(path: string): string {
  const cleanBase = BACKEND_BASE.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}