/**
 * Web auth proxy core
 *
 * Neden var?
 * - Web tarafında auth stratejimiz cookie-first çalışır.
 * - JSON proxy ve raw/file proxy aynı auth + tenant + refresh + retry omurgasını kullanır.
 * - Bu ortak davranışları tek yerde toplamak; bakım, tutarlılık ve hata ayıklamayı kolaylaştırır.
 *
 * Bu dosya neyi çözer?
 * - tenant çözümleme
 * - correlation-id üretme / taşıma
 * - backend url çözümleme
 * - timeout yönetimi
 * - request header oluşturma
 * - refresh çağrısı
 * - set-cookie extraction
 * - cookie merge
 * - response header filtreleme
 *
 * Bu dosya ne yapmaz?
 * - JSON parse etmez
 * - raw/binary response oluşturmaz
 * - request body serialize etmez
 *
 * Yani:
 * - proxyJsonWithWebAuth.ts => bu core'u kullanır + JSON davranışını ekler
 * - proxyRawWithWebAuth.ts  => bu core'u kullanır + raw/file davranışını ekler
 */

import { NextRequest } from "next/server";
import { resolveTenant } from "@/lib/bff/resolveTenant";

export const WEB_AUTH_BACKEND_BASE =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

export const DEFAULT_JSON_TIMEOUT_MS = 15_000;
export const DEFAULT_RAW_TIMEOUT_MS = 30_000;

export type WebProxyMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type RefreshResult = {
  ok: boolean;
  status: number;
  cookies: string[];
};

 
export function resolveCorrelationId(req: NextRequest): string {
  return req.headers.get("x-correlation-id") ?? crypto.randomUUID();
}

export function resolveBackendUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(
    url.startsWith("/") ? url : `/${url}`,
    WEB_AUTH_BACKEND_BASE
  ).toString();
}

export function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(id),
  };
}

export function applyHeaders(target: Headers, source?: HeadersInit): void {
  if (!source) return;

  if (source instanceof Headers) {
    source.forEach((value, key) => {
      target.set(key, value);
    });
    return;
  }

  if (Array.isArray(source)) {
    for (const [key, value] of source) {
      target.set(key, value);
    }
    return;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      target.set(key, String(value));
    }
  });
}

export function extractSetCookies(headers: Headers): string[] {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof withGetSetCookie.getSetCookie === "function") {
    try {
      return withGetSetCookie.getSetCookie();
    } catch {
      return [];
    }
  }

  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
}

export function mergeCookie(
  original: string | null,
  setCookies: string[]
): string {
  const map = new Map<string, string>();

  if (original) {
    original.split(";").forEach((part) => {
      const trimmed = part.trim();
      if (!trimmed) return;

      const idx = trimmed.indexOf("=");
      if (idx <= 0) return;

      const name = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();

      if (name) {
        map.set(name, value);
      }
    });
  }

  for (const setCookie of setCookies) {
    const firstPart = setCookie.split(";")[0]?.trim();
    if (!firstPart) continue;

    const idx = firstPart.indexOf("=");
    if (idx <= 0) continue;

    const name = firstPart.slice(0, idx).trim();
    const value = firstPart.slice(idx + 1).trim();

    if (name) {
      map.set(name, value);
    }
  }

  return Array.from(map.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

/*
 * Web auth standardı:
 * - Cookie varsa forward et
 * - Authorization varsa onu da forward et
 *
 * Neden?
 * - Bazı backend endpointleri cookie ile birlikte Authorization header'ını da bekleyebiliyor
 * - Pratikte çalışan route'larda hem cookie hem authorization birlikte gidiyor
 * - Sadece "cookie varsa auth gönderme" yaklaşımı bazı route'larda 401 üretiyor
 *
 * Not:
 * - Bu fonksiyon request'te gelen auth sinyallerini backend'e taşır
 * - Hangi auth kaynağının esas alınacağına backend karar verir
 */
export function buildWebAuthHeaders(
  req: NextRequest,
  correlationId: string,
  options?: {
    extraHeaders?: HeadersInit;
    defaultAccept?: string;
  }
): Headers {
  const headers = new Headers();

  headers.set(
    "accept",
    req.headers.get("accept") || options?.defaultAccept || "application/json"
  );

  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const auth =
    req.headers.get("authorization") ??
    req.headers.get("Authorization");

  if (auth) {
    headers.set("authorization", auth);
  }

  const lang = req.headers.get("accept-language");
  if (lang) {
    headers.set("accept-language", lang);
  }

  headers.set("x-tenant-key", resolveTenant(req));
  headers.set("x-correlation-id", correlationId);

  applyHeaders(headers, options?.extraHeaders);

  if (process.env.NODE_ENV !== "production") {
    console.log("[BFF][buildWebAuthHeaders]", {
      hasIncomingCookie: !!req.headers.get("cookie"),
      incomingCookieLength: req.headers.get("cookie")?.length ?? 0,
      hasIncomingAuthorization:
        !!req.headers.get("authorization") ||
        !!req.headers.get("Authorization"),
      forwardedCookie: headers.has("cookie"),
      forwardedAuthorization: headers.has("authorization"),
      tenant: headers.get("x-tenant-key"),
      correlationId: headers.get("x-correlation-id"),
    });
  }

  return headers;
}

export async function tryRefreshWebSession(
  req: NextRequest,
  timeoutMs: number,
  correlationId: string,
  logLabel: string
): Promise<RefreshResult> {
  const { signal, cleanup } = withTimeout(timeoutMs);
  const refreshUrl = `${req.nextUrl.origin}/api/v1.0/account/refresh`;

  try {
    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
        "x-tenant-key": resolveTenant(req),
        "x-correlation-id": correlationId,
        ...(req.headers.get("accept-language")
          ? { "accept-language": req.headers.get("accept-language")! }
          : {}),
        accept: "application/json",
      },
      cache: "no-store",
      signal,
    });

    const cookies = extractSetCookies(res.headers);

    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][REFRESH]`, {
        correlationId,
        refreshUrl,
        status: res.status,
        ok: res.ok,
        refreshCookieCount: cookies.length,
      });
    }

    return {
      ok: res.ok,
      status: res.status,
      cookies,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[BFF][${logLabel}][REFRESH_ERROR]`, {
        correlationId,
        refreshUrl,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return {
      ok: false,
      status: 0,
      cookies: [],
    };
  } finally {
    cleanup();
  }
}

export function shouldSkipResponseHeader(key: string): boolean {
  const lower = key.toLowerCase();

  return [
    "content-length",
    "connection",
    "transfer-encoding",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "upgrade",
    "set-cookie",
  ].includes(lower);
}

export function filterProxyResponseHeaders(
  upstream: Response,
  refreshCookies: string[]
): Headers {
  const headers = new Headers();

  upstream.headers.forEach((value, key) => {
    if (shouldSkipResponseHeader(key)) return;
    headers.set(key, value);
  });

  for (const cookie of extractSetCookies(upstream.headers)) {
    headers.append("set-cookie", cookie);
  }

  for (const cookie of refreshCookies) {
    headers.append("set-cookie", cookie);
  }

  return headers;
}

export function isAbortLikeError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;

  const message = err.message.toLowerCase();
  return err.name === "AbortError" || message.includes("abort");
}

export function buildMergedRetryHeaders(
  req: NextRequest,
  correlationId: string,
  refreshCookies: string[],
  options?: {
    extraHeaders?: HeadersInit;
    defaultAccept?: string;
  }
): Headers {
  const headers = buildWebAuthHeaders(req, correlationId, options);

  const mergedCookie = mergeCookie(req.headers.get("cookie"), refreshCookies);

  if (process.env.NODE_ENV !== "production") {
    console.log("[BFF][RETRY_COOKIE]", {
      originalCookieLength: req.headers.get("cookie")?.length ?? 0,
      refreshCookieCount: refreshCookies.length,
      mergedCookieLength: mergedCookie?.length ?? 0,
      correlationId,
    });
  }

  if (mergedCookie) {
    headers.set("cookie", mergedCookie);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[BFF][buildMergedRetryHeaders]", {
      forwardedCookie: headers.has("cookie"),
      cookieLength: headers.get("cookie")?.length ?? 0,
      forwardedAuthorization: headers.has("authorization"),
      tenant: headers.get("x-tenant-key"),
      correlationId: headers.get("x-correlation-id"),
    });
  }

  return headers;
}