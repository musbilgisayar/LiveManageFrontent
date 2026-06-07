// src/app/api/_shared/bff.ts
export const runtime = "nodejs";

import crypto from "node:crypto";
import { Agent, setGlobalDispatcher } from "undici";
import { NextRequest } from "next/server";
import { resolveTenant } from "@/lib/bff/resolveTenant";
import {
  proxyJsonWithWebAuth as proxyJsonWithCentralWebAuth,
} from "@/lib/bff/proxyJsonWithWebAuth";
import { ACCESS_TOKEN_COOKIE_NAMES } from "@/lib/bff/authCookies";
import { DEFAULT_TENANT_KEY, coerceTenantKey } from "@/lib/tenantKeys";

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

export const DEFAULT_TENANT =
  process.env.LM_DEFAULT_TENANT ||
  process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
  DEFAULT_TENANT_KEY;

const isDev = process.env.NODE_ENV !== "production";
const allowInsecure = process.env.BE_SSL_INSECURE === "true";
const SUPPORTED_LANGS = new Set(["tr", "en", "de", "fr", "it", "ar"]);

let dispatcherReady = false;

function ensureDevDispatcher() {
  if (dispatcherReady) return;
  if (!isDev || !allowInsecure) return;

  setGlobalDispatcher(
    new Agent({
      connect: { rejectUnauthorized: false },
    }),
  );
  dispatcherReady = true;
}

export async function getServiceToken(): Promise<string> {
  return SERVICE_JWT;
}

export function newCorrelationId(h?: Headers): string {
  return h?.get("x-correlation-id") ?? crypto.randomUUID();
}

function cultureFromShort(short: string): string {
  switch (short) {
    case "ar":
      return "ar-SA";
    case "de":
      return "de-DE";
    case "en":
      return "en-US";
    case "fr":
      return "fr-FR";
    case "it":
      return "it-IT";
    case "tr":
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
  fallback = "tr-TR",
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
  fallback = "tr",
): string {
  return normalizeLang(resolveAcceptLanguage(req, fallback)).short;
}

export function resolveTenantKey(
  req: NextRequest | Request,
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

export function pickClientAuth(
  req: NextRequest | Request,
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
    for (const name of ACCESS_TOKEN_COOKIE_NAMES) {
      const token = req.cookies.get(name)?.value?.trim();
      if (token) {
        return {
          header: `Bearer ${token}`,
          source: `cookie-${name}`,
        };
      }
    }
  }

  return null;
}

export function authHash(authHeader?: string | null): string {
  const normalized = (authHeader ?? "").trim();
  if (!normalized) return "noauth";

  return crypto.createHash("sha1").update(normalized).digest("hex").slice(0, 12);
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  ms = 10_000,
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

export async function readUpstreamBody(
  upstream: Response,
): Promise<{ data: unknown; contentType: string }> {
  const contentType = upstream.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return { data: await upstream.json(), contentType };
    } catch {
      return { data: null, contentType };
    }
  }

  try {
    return { data: await upstream.text(), contentType };
  } catch {
    return { data: "", contentType };
  }
}

export async function parseJsonSafe(
  response: Response,
): Promise<Record<string, unknown> | null> {
  const text = await response.text().catch(() => "");

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[];
};

export function normalizeSetCookieForBff(cookie: string): string {
  let normalized = cookie.replace(/;\s*Domain=[^;]+/i, "");

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

type ProxyJsonWithWebAuthOptions = {
  req: NextRequest;
  backendPath: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string | null;
  logLabel?: string;
  timeoutMs?: number;
};

function parseProxyBody(body: string | null): unknown {
  if (body === null || body === undefined) return undefined;
  if (!body.trim()) return undefined;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export async function proxyJsonWithWebAuth({
  req,
  backendPath,
  method = "GET",
  body = null,
  logLabel = "BFF WEB AUTH PROXY",
  timeoutMs = 15_000,
}: ProxyJsonWithWebAuthOptions) {
  const parsedBody = parseProxyBody(body);

return proxyJsonWithCentralWebAuth(req, {
  url: backendPath,
  method,
  body: parsedBody,
  timeoutMs,
  logLabel,
  headers: {
    "accept-language": resolveAcceptLanguage(req, "tr-TR"),
  },
});

}

export function buildBackendUrl(path: string): string {
  const cleanBase = BACKEND_BASE.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
