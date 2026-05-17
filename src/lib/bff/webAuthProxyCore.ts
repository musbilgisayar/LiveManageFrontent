// ============================================================
// File: src/lib/bff/webAuthProxyCore.ts
// ============================================================

import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { resolveTenant } from "@/lib/bff/resolveTenant";
import { normalizeSetCookieForBrowser } from "@/lib/bff/authCookies";

export const WEB_AUTH_BACKEND_BASE =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

export const DEFAULT_JSON_TIMEOUT_MS = 15_000;
export const DEFAULT_RAW_TIMEOUT_MS = 30_000;
export const ACCESS_REFRESH_SKEW_SECONDS =
  process.env.NODE_ENV === "production" ? 120 : 14 * 60;

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

const refreshInFlight = new Map<string, Promise<RefreshResult>>();

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

function splitCombinedSetCookie(headerValue: string): string[] {
  const result: string[] = [];
  let current = "";
  let inExpires = false;

  for (let i = 0; i < headerValue.length; i += 1) {
    const char = headerValue[i];
    const remaining = headerValue.slice(i);

    if (!inExpires && remaining.toLowerCase().startsWith("expires=")) {
      inExpires = true;
    }

    if (inExpires && char === ";") {
      inExpires = false;
    }

    if (!inExpires && char === ",") {
      const rest = headerValue.slice(i + 1);
      const cookieStartMatch = rest.match(
        /^\s*([!#$%&'*+\-.^_`|~0-9A-Za-z]+)=/
      );

      if (cookieStartMatch) {
        if (current.trim()) {
          result.push(current.trim());
        }
        current = "";
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

export function extractSetCookies(headers: Headers): string[] {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof withGetSetCookie.getSetCookie === "function") {
    try {
      const cookies = withGetSetCookie.getSetCookie();
      if (Array.isArray(cookies) && cookies.length > 0) {
        return cookies.filter(Boolean);
      }
    } catch {
      // Fallback below.
    }
  }

  const raw = headers.get("set-cookie");
  if (!raw) {
    return [];
  }

  return splitCombinedSetCookie(raw).filter(Boolean);
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

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  return Buffer.from(padded, "base64").toString("utf8");
}

function readCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";");

  for (const part of parts) {
    const trimmed = part.trim();
    const index = trimmed.indexOf("=");

    if (index <= 0) continue;

    const cookieName = trimmed.slice(0, index).trim();
    const cookieValue = trimmed.slice(index + 1).trim();

    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
}

function getJwtExpUnixSeconds(token: string): number | null {
  const parts = token.split(".");

  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as {
      exp?: unknown;
    };

    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function shouldProactivelyRefreshAccessToken(
  req: NextRequest,
  skewSeconds: number = ACCESS_REFRESH_SKEW_SECONDS
): boolean {
  const accessToken = readCookieValue(req.headers.get("cookie"), "accessToken");

  if (!accessToken) {
    return false;
  }

  const exp = getJwtExpUnixSeconds(accessToken);

  if (!exp) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const remainingSeconds = exp - now;

  return remainingSeconds > 0 && remainingSeconds <= skewSeconds;
}
export function buildWebAuthHeaders(
  req: NextRequest,
  correlationId: string,
  options?: {
    extraHeaders?: HeadersInit;
    defaultAccept?: string;
    includeAuthorization?: boolean;
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

  const includeAuthorization = options?.includeAuthorization ?? true;

  if (includeAuthorization) {
    const auth =
      req.headers.get("authorization") ??
      req.headers.get("Authorization");

    if (auth) {
      headers.set("authorization", auth);
    }
  }

  const lang = req.headers.get("accept-language");
  if (lang) {
    headers.set("accept-language", lang);
  }

  headers.set("x-tenant-key", resolveTenant(req));
  headers.set("x-correlation-id", correlationId);

  applyHeaders(headers, options?.extraHeaders);

  return headers;
}

function getRefreshKey(req: NextRequest): string {
  const tenant = resolveTenant(req);
  const cookie = req.headers.get("cookie") ?? "";
  const cookieHash = createHash("sha256").update(cookie).digest("hex");
  return `${tenant}::${cookieHash}`;
}

export async function tryRefreshWebSession(
  req: NextRequest,
  timeoutMs: number,
  correlationId: string,
  logLabel: string
): Promise<RefreshResult> {
  const key = getRefreshKey(req);
  const existing = refreshInFlight.get(key);

  if (existing) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][REFRESH_REUSE]`, {
        correlationId,
        refreshKey: key,
      });
    }
    return existing;
  }

  const promise = (async (): Promise<RefreshResult> => {
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

      let bodyOk = false;

      try {
        const payload = await res.clone().json().catch(() => null);
        bodyOk = payload?.ok === true;
      } catch {
        bodyOk = false;
      }

      const ok = res.ok && (cookies.length > 0 || bodyOk);

      if (process.env.NODE_ENV !== "production") {
        console.info(`[BFF][${logLabel}][REFRESH]`, {
          correlationId,
          refreshUrl,
          status: res.status,
          ok: res.ok,
          bodyOk,
          effectiveOk: ok,
          refreshCookieCount: cookies.length,
          refreshCookieNames: cookies.map((c) => c.split("=")[0]),
          rawSetCookieHeader: res.headers.get("set-cookie") ?? "(yok)",
        });
      }

      return {
        ok,
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
  })();

  refreshInFlight.set(key, promise);

  try {
    return await promise;
  } finally {
    refreshInFlight.delete(key);
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

  const cookieMap = new Map<string, string>();

  for (const cookie of extractSetCookies(upstream.headers)) {
    const name = cookie.split("=")[0]?.trim();
    if (name) cookieMap.set(name, normalizeSetCookieForBrowser(cookie));
  }

  for (const cookie of refreshCookies) {
    const name = cookie.split("=")[0]?.trim();
    if (name) cookieMap.set(name, normalizeSetCookieForBrowser(cookie));
  }

  for (const cookie of cookieMap.values()) {
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
  const headers = buildWebAuthHeaders(req, correlationId, {
    ...options,
    includeAuthorization: false,
  });

  const mergedCookie = mergeCookie(req.headers.get("cookie"), refreshCookies);

  if (process.env.NODE_ENV !== "production") {
    console.info("[BFF][RETRY_COOKIE]", {
      correlationId,
      originalCookieLength: req.headers.get("cookie")?.length ?? 0,
      refreshCookieCount: refreshCookies.length,
      mergedCookieLength: mergedCookie.length,
      refreshCookieNames: refreshCookies.map((c) => c.split("=")[0]),
    });
  }

  if (mergedCookie) {
    headers.set("cookie", mergedCookie);
  }

  return headers;
}
