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
 */

import crypto from "node:crypto";
import { Agent, setGlobalDispatcher } from "undici";
import { NextRequest, NextResponse } from "next/server";
import { resolveTenant } from "@/lib/bff/resolveTenant";
import { DEFAULT_TENANT_KEY, coerceTenantKey } from "@/lib/tenantKeys";

/* -------------------------------------------------------------------------- */
/* ENV / RUNTIME                                                              */
/* -------------------------------------------------------------------------- */

export const BACKEND_BASE =
  process.env.BACKEND_BASE ||
  process.env.BACKEND_URL ||
  process.env.BACKEND_BASE_URL ||
  process.env.LM_BACKEND_BASE ||
  "https://localhost:5002";

export const SERVICE_JWT =
  process.env.SVC_JWT ||
  process.env.SERVICE_JWT ||
  process.env.SERVICE_TOKEN ||
  "";

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

export function newCorrelationId(h?: Headers): string {
  return h?.get("x-correlation-id") ?? crypto.randomUUID();
}

/* -------------------------------------------------------------------------- */
/* LANGUAGE                                                                   */
/* -------------------------------------------------------------------------- */

const SUPPORTED_LANGS = new Set(["tr", "en", "de", "fr", "it", "ar"]);

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

export function normalizeLang(raw?: string) {
  const value = (raw || "tr").trim().toLowerCase();
  const short = value.split("-")[0];
  const norm = SUPPORTED_LANGS.has(short) ? short : "tr";

  return {
    short: norm,
    culture: cultureFromShort(norm),
  };
}

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
    return fromHeader.includes("-")
      ? fromHeader
      : normalizeLang(fromHeader).culture;
  }

  return fallback;
}

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

export const DEFAULT_TENANT =
  process.env.LM_DEFAULT_TENANT ||
  process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
  DEFAULT_TENANT_KEY;

export function resolveTenantKey(
  req: NextRequest | Request
): {
  tenantKey: string;
  source: "header" | "cookie" | "fallback(bff)";
} {
  const fromHeader = req.headers.get("x-tenant-key")?.trim();
  if (fromHeader) {
    return {
      tenantKey: coerceTenantKey(fromHeader, DEFAULT_TENANT),
      source: "header",
    };
  }

  if ("cookies" in req) {
    const fromCookie =
      req.cookies.get("lm.tenant")?.value?.trim() ||
      req.cookies.get("tenantKey")?.value?.trim();

    if (fromCookie) {
      return {
        tenantKey: coerceTenantKey(fromCookie, DEFAULT_TENANT),
        source: "cookie",
      };
    }
  }

  const resolved = resolveTenant(req as NextRequest);
  return {
    tenantKey: coerceTenantKey(resolved || DEFAULT_TENANT),
    source: "fallback(bff)",
  };
}

/* -------------------------------------------------------------------------- */
/* AUTH                                                                       */
/* -------------------------------------------------------------------------- */

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

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[];
};

export function normalizeSetCookieForBff(cookie: string): string {
  let normalized = cookie;

  normalized = normalized.replace(/;\s*Domain=[^;]+/i, "");

  if (process.env.NODE_ENV === "development") {
    normalized = normalized.replace(/;\s*Secure/gi, "");
  }

  return normalized;
}

export function appendSetCookies(source: Headers, target: Headers): string[] {
  const getSetCookieFn = (source as HeadersWithSetCookie).getSetCookie;

  if (typeof getSetCookieFn === "function") {
    const cookies = getSetCookieFn.call(source) ?? [];
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

function parseCookieNameValue(setCookie: string): { name: string; value: string } | null {
  const firstPart = setCookie.split(";")[0]?.trim();
  if (!firstPart) return null;

  const eqIndex = firstPart.indexOf("=");
  if (eqIndex <= 0) return null;

  const name = firstPart.slice(0, eqIndex).trim();
  const value = firstPart.slice(eqIndex + 1).trim();

  if (!name) return null;
  return { name, value };
}

function mergeCookieHeader(
  originalCookieHeader: string,
  setCookies: string[]
): string {
  const jar = new Map<string, string>();

  for (const rawPart of originalCookieHeader.split(";")) {
    const part = rawPart.trim();
    if (!part) continue;

    const eqIndex = part.indexOf("=");
    if (eqIndex <= 0) continue;

    const name = part.slice(0, eqIndex).trim();
    const value = part.slice(eqIndex + 1).trim();

    if (name) {
      jar.set(name, value);
    }
  }

  for (const setCookie of setCookies) {
    const parsed = parseCookieNameValue(setCookie);
    if (!parsed) continue;
    jar.set(parsed.name, parsed.value);
  }

  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

/* -------------------------------------------------------------------------- */
/* CACHE                                                                      */
/* -------------------------------------------------------------------------- */

const mem = new Map<string, { exp: number; val: unknown }>();

export function cacheGet<T>(key: string): T | null {
  const hit = mem.get(key);
  if (!hit || hit.exp < Date.now()) {
    mem.delete(key);
    return null;
  }

  return hit.val as T;
}

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

export function cacheDelete(key: string): void {
  mem.delete(key);
}

/* -------------------------------------------------------------------------- */
/* WEB AUTH PROXY WITH REFRESH                                                */
/* -------------------------------------------------------------------------- */

type ProxyJsonWithWebAuthOptions = {
  req: NextRequest;
  backendPath: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string | null;
  logLabel?: string;
  timeoutMs?: number;
};

export async function proxyJsonWithWebAuth({
  req,
  backendPath,
  method = "GET",
  body = null,
  logLabel = "BFF WEB AUTH PROXY",
  timeoutMs = 15_000,
}: ProxyJsonWithWebAuthOptions) {
  const correlationId = newCorrelationId(req.headers);
  const { tenantKey, source: tenantSource } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req, "tr-TR");

  const responseHeaders = new Headers({
    "x-correlation-id": correlationId,
  });

  let cookieHeader = req.headers.get("cookie") ?? "";

  const buildHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      accept: "application/json",
      "x-correlation-id": correlationId,
      "x-tenant-key": tenantKey,
      "accept-language": acceptLanguage,
      cookie: cookieHeader,
    };

    if (body !== null && body !== undefined) {
      headers["content-type"] = "application/json";
    }

    return headers;
  };

  async function send(path: string) {
    return fetchWithTimeout(
      buildBackendUrl(path),
      {
        method,
        cache: "no-store",
        headers: buildHeaders(),
        body: body ?? undefined,
      },
      timeoutMs
    );
  }

  console.group(`🟦 [${logLabel}]`);

  try {
    console.log("➡️ Upstream istek başladı", {
      correlationId,
      tenantKey,
      tenantSource,
      acceptLanguage,
      backendPath,
      method,
      hasCookie: !!cookieHeader,
    });

    let upstream = await send(backendPath);

    if (upstream.status === 401) {
      console.warn("🟧 Upstream 401 döndü, refresh deneniyor", {
        correlationId,
        tenantKey,
        backendPath,
      });

      const refresh = await fetchWithTimeout(
        buildBackendUrl("/api/v1.0/account/refresh"),
        {
          method: "POST",
          cache: "no-store",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-correlation-id": correlationId,
            "x-tenant-key": tenantKey,
            "accept-language": acceptLanguage,
            cookie: cookieHeader,
          },
          body: JSON.stringify({ clientType: "web" }),
        },
        timeoutMs
      );

      const refreshSetCookies = appendSetCookies(refresh.headers, responseHeaders);

      if (refresh.ok) {
        cookieHeader = mergeCookieHeader(cookieHeader, refreshSetCookies);

        console.log("✅ Refresh başarılı, original request retry ediliyor", {
          correlationId,
          tenantKey,
          backendPath,
          forwardedCookieCount: refreshSetCookies.length,
        });

        upstream = await send(backendPath);
      } else {
        console.warn("🟥 Refresh başarısız", {
          correlationId,
          tenantKey,
          status: refresh.status,
        });

        const { data, contentType } = await readUpstreamBody(refresh);

        console.groupEnd();

        if (contentType.includes("application/json")) {
          return NextResponse.json(data, {
            status: refresh.status,
            headers: responseHeaders,
          });
        }

        return new NextResponse(typeof data === "string" ? data : null, {
          status: refresh.status,
          headers: responseHeaders,
        });
      }
    }

    const { data, contentType } = await readUpstreamBody(upstream);

    appendSetCookies(upstream.headers, responseHeaders);

    console.log("⬅️ Upstream response hazır", {
      correlationId,
      tenantKey,
      status: upstream.status,
      ok: upstream.ok,
      contentType,
    });

    console.groupEnd();

    if (contentType.includes("application/json")) {
      return NextResponse.json(data, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    return new NextResponse(typeof data === "string" ? data : null, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`🟥 [${logLabel} ERROR]`, {
      correlationId,
      tenantKey,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    console.groupEnd();

    return NextResponse.json(
      {
        ok: false,
        error: `${logLabel.replaceAll(" ", "_")}_ERROR`,
        correlationId,
      },
      { status: 500, headers: responseHeaders }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* OPTIONAL HELPERS                                                           */
/* -------------------------------------------------------------------------- */

export function buildBackendUrl(path: string): string {
  const cleanBase = BACKEND_BASE.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
