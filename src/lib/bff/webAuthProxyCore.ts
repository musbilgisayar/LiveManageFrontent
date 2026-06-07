import { createHash, randomUUID } from "crypto";
import { NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE_NAMES,
  DEVICE_ID_COOKIE_NAMES,
  REFRESH_TOKEN_COOKIE_NAMES,
  appendExpiredAuthCookies,
  normalizeSetCookieForBrowser,
  readFirstCookieValue,
} from "@/lib/bff/authCookies";
import { resolveTenant } from "@/lib/bff/resolveTenant";

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
  reason?: string;
};

export const DEFAULT_JSON_TIMEOUT_MS = 20_000;

/**
 * Türkçe not:
 * Development ortamında 14 dakika çok agresifti.
 * Access token 15 dakikaysa 1 dakika sonra refresh başlıyordu.
 */
export const ACCESS_REFRESH_SKEW_SECONDS =
  process.env.NODE_ENV === "production" ? 120 : 60;

const RECENT_REFRESH_RESULT_TTL_MS = 5_000;

const refreshInFlight = new Map<string, Promise<RefreshResult>>();

const recentRefreshResults = new Map<
  string,
  {
    expiresAt: number;
    result: RefreshResult;
  }
>();

export function resolveCorrelationId(req: NextRequest): string {
  return (
    req.headers.get("x-correlation-id") ||
    req.headers.get("correlation-id") ||
    randomUUID()
  );
}

export function resolveBackendUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const baseUrl =
    process.env.BACKEND_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
    "https://localhost:5002";

  return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

export function withTimeout(timeoutMs: number): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timer),
  };
}

export function isAbortLikeError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function hashValue(value: string | null | undefined): string {
  return createHash("sha256")
    .update(value ?? "")
    .digest("hex")
    .slice(0, 24);
}

function getCanonicalCookieValue(
  req: NextRequest,
  names: readonly string[],
): string | null {
  return readFirstCookieValue(req, names);
}

/**
 * Türkçe not:
 * Refresh lock artık tüm cookie header hash'ine bağlı değil.
 * Tenant + device + refresh token hash kullanılır.
 */
function getRefreshKey(req: NextRequest): string {
  const tenant = resolveTenant(req);
  const deviceId =
    getCanonicalCookieValue(req, DEVICE_ID_COOKIE_NAMES) ?? "no-device";

  const refreshToken =
    getCanonicalCookieValue(req, REFRESH_TOKEN_COOKIE_NAMES) ?? "no-refresh";

  return [tenant || "no-tenant", deviceId, hashValue(refreshToken)].join("::");
}

function cleanupRecentRefreshResults(): void {
  const now = Date.now();

  for (const [key, entry] of recentRefreshResults.entries()) {
    if (entry.expiresAt <= now) {
      recentRefreshResults.delete(key);
    }
  }
}

function getRecentRefreshResult(key: string): RefreshResult | null {
  cleanupRecentRefreshResults();

  const cached = recentRefreshResults.get(key);

  if (!cached || cached.expiresAt <= Date.now()) {
    recentRefreshResults.delete(key);
    return null;
  }

  return cached.result;
}

function rememberRecentRefreshResult(
  key: string,
  result: RefreshResult,
): void {
  if (!result.ok || result.cookies.length === 0) {
    return;
  }

  recentRefreshResults.set(key, {
    expiresAt: Date.now() + RECENT_REFRESH_RESULT_TTL_MS,
    result,
  });
}

function decodeJwtPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload =
      payload + "=".repeat((4 - (payload.length % 4)) % 4);

    const json = Buffer.from(paddedPayload, "base64").toString("utf8");

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readJwtExpSeconds(token: string | null): number | null {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;

  return typeof exp === "number" ? exp : null;
}

export function shouldProactivelyRefreshAccessToken(req: NextRequest): boolean {
  const accessToken = getCanonicalCookieValue(req, ACCESS_TOKEN_COOKIE_NAMES);

  if (!accessToken) {
    return false;
  }

  const expSeconds = readJwtExpSeconds(accessToken);

  if (!expSeconds) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const remainingSeconds = expSeconds - nowSeconds;

  return (
    remainingSeconds > 0 &&
    remainingSeconds <= ACCESS_REFRESH_SKEW_SECONDS
  );
}

function appendForwardedHeader(
  headers: Headers,
  name: string,
  value: string | null,
): void {
  if (value && value.trim()) {
    headers.set(name, value);
  }
}

function appendExtraHeaders(
  headers: Headers,
  extraHeaders?: HeadersInit,
): void {
  if (!extraHeaders) return;

  const extra = new Headers(extraHeaders);

  extra.forEach((value, key) => {
    headers.set(key, value);
  });
}

export function buildWebAuthHeaders(
  req: NextRequest,
  correlationId: string,
  options?: {
    extraHeaders?: HeadersInit;
    defaultAccept?: string;
    includeTenantHeader?: boolean;
  },
): Headers {
  const headers = new Headers();

  headers.set("accept", options?.defaultAccept ?? "application/json");
  headers.set("x-correlation-id", correlationId);

  appendForwardedHeader(
    headers,
    "accept-language",
    req.headers.get("accept-language"),
  );

  appendForwardedHeader(headers, "user-agent", req.headers.get("user-agent"));

  appendForwardedHeader(
    headers,
    "x-forwarded-for",
    req.headers.get("x-forwarded-for"),
  );

  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  if (options?.includeTenantHeader !== false) {
    const tenantKey = resolveTenant(req);

    if (tenantKey) {
      headers.set("x-tenant-key", tenantKey);
    }
  }

  appendExtraHeaders(headers, options?.extraHeaders);

  return headers;
}

function readSetCookieHeaders(response: Response): string[] {
  const getSetCookie = (
    response.headers as Headers & {
      getSetCookie?: () => string[];
    }
  ).getSetCookie;

  if (typeof getSetCookie === "function") {
    return getSetCookie.call(response.headers);
  }

  const single = response.headers.get("set-cookie");

  if (!single) return [];

  return splitCombinedSetCookie(single);
}

function splitCombinedSetCookie(value: string): string[] {
  return value
    .split(/,(?=\s*[^;,]+=)/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readCookieNameValueFromSetCookie(
  cookie: string,
): { name: string; value: string } | null {
  const firstPart = cookie.split(";")[0];
  const separatorIndex = firstPart.indexOf("=");

  if (separatorIndex <= 0) {
    return null;
  }

  return {
    name: firstPart.slice(0, separatorIndex).trim(),
    value: firstPart.slice(separatorIndex + 1).trim(),
  };
}

function mergeCookieHeader(
  originalCookieHeader: string,
  setCookies: string[],
): string {
  const jar = new Map<string, string>();

  for (const part of originalCookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const index = trimmed.indexOf("=");
    if (index <= 0) continue;

    jar.set(trimmed.slice(0, index).trim(), trimmed.slice(index + 1).trim());
  }

  for (const cookie of setCookies) {
    const parsed = readCookieNameValueFromSetCookie(cookie);

    if (!parsed) continue;

    if (parsed.value) {
      jar.set(parsed.name, parsed.value);
    } else {
      jar.delete(parsed.name);
    }
  }

  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

export function buildMergedRetryHeaders(
  req: NextRequest,
  correlationId: string,
  refreshCookies: string[],
  options?: {
    extraHeaders?: HeadersInit;
    defaultAccept?: string;
    includeTenantHeader?: boolean;
  },
): Headers {
  const headers = buildWebAuthHeaders(req, correlationId, options);

  const originalCookieHeader = req.headers.get("cookie") ?? "";
  const mergedCookieHeader = mergeCookieHeader(originalCookieHeader, refreshCookies);

  if (mergedCookieHeader) {
    headers.set("cookie", mergedCookieHeader);
  }

  return headers;
}

export function filterProxyResponseHeaders(
  upstream: Response,
  refreshCookies: string[] = [],
): Headers {
  const headers = new Headers();

  const contentType = upstream.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  for (const cookie of refreshCookies) {
    headers.append("set-cookie", normalizeSetCookieForBrowser(cookie));
  }

  return headers;
}

export function appendSessionExpiredCookies(headers: Headers): number {
  return appendExpiredAuthCookies(headers);
}

async function readRefreshBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => "");

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isRefreshBodyFailure(body: unknown): boolean {
  return (
    !!body &&
    typeof body === "object" &&
    (body as Record<string, unknown>).ok === false
  );
}

function isRefreshBodyOk(body: unknown): boolean {
  return (
    !!body &&
    typeof body === "object" &&
    (body as Record<string, unknown>).ok === true
  );
}

function extractRefreshFailureReason(status: number, body: unknown): string {
  if (status === 0) return "NETWORK_ERROR";
  if (status === 408 || status === 504) return "TIMEOUT";

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const reason = record.reason ?? record.code;

    if (typeof reason === "string" && reason.trim()) {
      return reason.trim();
    }
  }

  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";

  return "REFRESH_FAILED";
}

async function executeRefreshRequest(
  req: NextRequest,
  timeoutMs: number,
  correlationId: string,
  logLabel: string,
): Promise<RefreshResult> {
  const refreshUrl = new URL(
    "/api/v1.0/account/refresh",
    req.nextUrl.origin,
  ).toString();

  const { signal, cleanup } = withTimeout(timeoutMs);

  try {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][REFRESH_REQUEST_STARTED]`, {
        correlationId,
        refreshUrl,
      });
    }

    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: buildWebAuthHeaders(req, correlationId, {
        includeTenantHeader: true,
      }),
      cache: "no-store",
      signal,
    });

    const cookies = readSetCookieHeaders(response)
      .map(normalizeSetCookieForBrowser)
      .filter(Boolean);

    const body = await readRefreshBody(response);
    const bodyFailure = isRefreshBodyFailure(body);
    const bodyOk = isRefreshBodyOk(body);

    const ok = response.ok && !bodyFailure && (cookies.length > 0 || bodyOk);

    const result: RefreshResult = {
      ok,
      status: response.status,
      cookies,
      reason: ok
        ? undefined
        : extractRefreshFailureReason(response.status, body),
    };

    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][REFRESH_RESPONSE]`, {
        correlationId,
        status: response.status,
        ok: result.ok,
        reason: result.reason,
        cookieCount: cookies.length,
        bodyOk,
        bodyFailure,
      });
    }

    return result;
  } catch (error) {
    const aborted = isAbortLikeError(error);

    const result: RefreshResult = {
      ok: false,
      status: aborted ? 504 : 0,
      cookies: [],
      reason: aborted ? "TIMEOUT" : "NETWORK_ERROR",
    };

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[BFF][${logLabel}][REFRESH_ERROR]`, {
        correlationId,
        reason: result.reason,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return result;
  } finally {
    cleanup();
  }
}

export async function tryRefreshWebSession(
  req: NextRequest,
  timeoutMs: number,
  correlationId: string,
  logLabel: string,
): Promise<RefreshResult> {
  const key = getRefreshKey(req);

  const recent = getRecentRefreshResult(key);
  if (recent) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][RECENT_REFRESH_REUSED]`, {
        correlationId,
        keyHash: hashValue(key),
        cookieCount: recent.cookies.length,
      });
    }

    return recent;
  }

  const existing = refreshInFlight.get(key);
  if (existing) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][REFRESH_COORDINATOR_JOINED]`, {
        correlationId,
        keyHash: hashValue(key),
      });
    }

    return existing;
  }

  const promise = executeRefreshRequest(req, timeoutMs, correlationId, logLabel);

  refreshInFlight.set(key, promise);

  if (process.env.NODE_ENV !== "production") {
    console.info(`[BFF][${logLabel}][REFRESH_COORDINATOR_ACQUIRED]`, {
      correlationId,
      keyHash: hashValue(key),
    });
  }

  try {
    const result = await promise;

    rememberRecentRefreshResult(key, result);

    return result;
  } finally {
    refreshInFlight.delete(key);

    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][REFRESH_COORDINATOR_RELEASED]`, {
        correlationId,
        keyHash: hashValue(key),
      });
    }
  }
}