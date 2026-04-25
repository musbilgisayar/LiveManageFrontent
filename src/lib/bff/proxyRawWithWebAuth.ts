//src/lib/bff/proxyRawWithWebAuth.ts
/**
 * Web auth için raw/file odaklı BFF proxy helper.
 *
 * Kapsam:
 * - HttpOnly cookie + BFF session tabanlı web auth
 * - FormData upload
 * - file download
 * - binary / blob / pdf / excel / zip
 * - 401 → refresh → retry
 * - tenant + correlation-id + language forwarding
 *
 * Bilinçli sınırlar:
 * - JSON response normalize etmez
 * - response body'yi ham/raw geçirir
 * - mobile bearer-first auth için kullanılmaz
 */

import { NextRequest, NextResponse } from "next/server";
import { resolveTenant } from "./resolveTenant";
const BACKEND_BASE =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

const DEFAULT_TIMEOUT_MS = 30000;

type WebProxyMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

type ProxyRawOptions = {
  url: string;
  method?: WebProxyMethod;
  body?: BodyInit | null;
  timeoutMs?: number;
  extraHeaders?: HeadersInit;
  logLabel?: string;
};

 

function resolveCorrelationId(req: NextRequest) {
  return req.headers.get("x-correlation-id") ?? crypto.randomUUID();
}

function resolveUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return new URL(url.startsWith("/") ? url : `/${url}`, BACKEND_BASE).toString();
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(id),
  };
}

function extractSetCookies(headers: Headers): string[] {
  const h = headers as Headers & { getSetCookie?: () => string[] };

  if (typeof h.getSetCookie === "function") {
    try {
      return h.getSetCookie();
    } catch {}
  }

  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
}

function mergeCookie(original: string | null, setCookies: string[]) {
  const map = new Map<string, string>();

  if (original) {
    original.split(";").forEach((c) => {
      const trimmed = c.trim();
      if (!trimmed) return;

      const idx = trimmed.indexOf("=");
      if (idx <= 0) return;

      const name = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (name) map.set(name, value);
    });
  }

  for (const sc of setCookies) {
    const first = sc.split(";")[0]?.trim();
    if (!first) continue;

    const idx = first.indexOf("=");
    if (idx <= 0) continue;

    const name = first.slice(0, idx).trim();
    const value = first.slice(idx + 1).trim();
    if (name) map.set(name, value);
  }

  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function applyHeaders(target: Headers, source?: HeadersInit) {
  if (!source) return;

  if (source instanceof Headers) {
    source.forEach((value, key) => target.set(key, value));
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

function buildHeaders(req: NextRequest, extra?: HeadersInit) {
  const headers = new Headers();

  const accept = req.headers.get("accept");
  if (accept) {
    headers.set("accept", accept);
  }

  // Web auth standardı: cookie-first
  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  } else {
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);
  }

  const lang = req.headers.get("accept-language");
  if (lang) headers.set("accept-language", lang);

  headers.set("x-tenant-key", resolveTenant(req));
  headers.set("x-correlation-id", resolveCorrelationId(req));

  applyHeaders(headers, extra);

  return headers;
}

async function tryRefresh(req: NextRequest, timeoutMs: number) {
  const { signal, cleanup } = withTimeout(timeoutMs);

  try {
    const res = await fetch(`${req.nextUrl.origin}/api/v1.0/account/refresh`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
        "x-tenant-key": resolveTenant(req),
        "x-correlation-id": resolveCorrelationId(req),
        ...(req.headers.get("accept-language")
          ? { "accept-language": req.headers.get("accept-language")! }
          : {}),
      },
      cache: "no-store",
      signal,
    });

    return {
      ok: res.ok,
      cookies: extractSetCookies(res.headers),
      status: res.status,
    };
  } catch {
    return {
      ok: false,
      cookies: [],
      status: 0,
    };
  } finally {
    cleanup();
  }
}

function shouldSkipResponseHeader(key: string) {
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

function filterHeaders(upstream: Response, refreshCookies: string[]) {
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

function shouldForwardContentType(body: BodyInit | null | undefined) {
  if (body === undefined || body === null) return false;
  if (body instanceof FormData) return false;
  return true;
}

export async function proxyRawWithWebAuth(
  req: NextRequest,
  options: ProxyRawOptions
) {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const logLabel = options.logLabel ?? "ProxyRawWithWebAuth";
  const targetUrl = resolveUrl(options.url);
  const correlationId = resolveCorrelationId(req);

  if (process.env.NODE_ENV !== "production") {
    console.info(`[BFF][${logLabel}][IN]`, {
      correlationId,
      method,
      targetUrl,
      tenantKey: resolveTenant(req),
      hasCookie: !!req.headers.get("cookie"),
      hasAuthorization: !!req.headers.get("authorization"),
      hasBody: options.body !== undefined && options.body !== null,
      bodyType:
        options.body instanceof FormData
          ? "FormData"
          : options.body
            ? typeof options.body
            : "none",
      timeoutMs,
    });
  }

  try {
    let headers = buildHeaders(req, options.extraHeaders);

    if (shouldForwardContentType(options.body) && req.headers.get("content-type")) {
      headers.set("content-type", req.headers.get("content-type")!);
    }

    const { signal, cleanup } = withTimeout(timeoutMs);

    let upstream: Response;
    try {
      upstream = await fetch(targetUrl, {
        method,
        headers,
        body: options.body ?? undefined,
        cache: "no-store",
        signal,
      });
    } finally {
      cleanup();
    }

    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][UPSTREAM_FIRST]`, {
        correlationId,
        status: upstream.status,
      });
    }

    let refreshCookies: string[] = [];

    if (upstream.status === 401) {
      const refresh = await tryRefresh(req, timeoutMs);

      if (refresh.ok) {
        refreshCookies = refresh.cookies;

        const mergedCookie = mergeCookie(
          req.headers.get("cookie"),
          refreshCookies
        );

        headers = buildHeaders(req, options.extraHeaders);

        if (mergedCookie) {
          headers.set("cookie", mergedCookie);
        }

        if (shouldForwardContentType(options.body) && req.headers.get("content-type")) {
          headers.set("content-type", req.headers.get("content-type")!);
        }

        const retryTimeout = withTimeout(timeoutMs);
        try {
          upstream = await fetch(targetUrl, {
            method,
            headers,
            body: options.body ?? undefined,
            cache: "no-store",
            signal: retryTimeout.signal,
          });
        } finally {
          retryTimeout.cleanup();
        }

        if (process.env.NODE_ENV !== "production") {
          console.info(`[BFF][${logLabel}][UPSTREAM_RETRY]`, {
            correlationId,
            status: upstream.status,
            retryUsed: true,
            refreshCookieCount: refreshCookies.length,
          });
        }
      }
    }

    const responseHeaders = filterHeaders(upstream, refreshCookies);

    if (upstream.status === 204 || upstream.status === 205) {
      return new NextResponse(null, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    const arrayBuffer = await upstream.arrayBuffer();

    if (!responseHeaders.has("content-type") && contentType) {
      responseHeaders.set("content-type", contentType);
    }

    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][OUT]`, {
        correlationId,
        finalStatus: upstream.status,
        contentType,
        byteLength: arrayBuffer.byteLength,
      });
    }

    return new NextResponse(arrayBuffer, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    const isTimeout =
      err?.name === "AbortError" || err?.message?.includes("abort");

    if (process.env.NODE_ENV !== "production") {
      console.error(`[BFF][${logLabel}][EX]`, {
        correlationId,
        targetUrl,
        method,
        error: err instanceof Error ? err.message : "Unknown error",
        timeoutMs,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: isTimeout ? "Timeout" : "Proxy raw error",
        userMessage: isTimeout
          ? "İstek zaman aşımına uğradı."
          : "Beklenmeyen bir hata oluştu.",
        correlationId,
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}