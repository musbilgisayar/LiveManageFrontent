// src/lib/bff/proxyJsonWithWebAuthCached.ts

import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { cacheGet, cacheSet, getServiceToken } from "@/app/api/_shared/bff";

import { ensureBackendTlsReady } from "./backendTls";
import {
  applyCacheHeaders,
  buildNotModifiedResponse,
  buildWeakEtag,
  shouldReturnNotModified,
} from "./httpCache";
import { resolveTenant } from "./resolveTenant";
import {
  DEFAULT_JSON_TIMEOUT_MS,
  type RefreshResult,
  type WebProxyMethod,
  appendSessionExpiredCookies,
  buildMergedRetryHeaders,
  buildWebAuthHeaders,
  filterProxyResponseHeaders,
  isAbortLikeError,
  resolveBackendUrl,
  resolveCorrelationId,
  tryRefreshWebSession,
  withTimeout,
} from "./webAuthProxyCore";

const DEBUG_BFF_PROXY =
  process.env.NEXT_PUBLIC_DEBUG_BFF_PROXY === "true" ||
  process.env.DEBUG_BFF_PROXY === "true";

type CachedTransformContext = {
  req: NextRequest;
  correlationId: string;
  logLabel: string;
  upstreamStatus: number;
  retryUsed: boolean;
  cacheHit: boolean;
  requestIfNoneMatch?: string;
};

type CachedTransformResult = {
  body: unknown;
  status?: number;
  headers?: HeadersInit;
  cache?: {
    enabled?: boolean;
    value?: unknown;
    ttlSeconds?: number;
    auditLog?: string;
    etagSource?: unknown;
    cacheControl?: string;
    vary?: string;
  };
};

type EnabledCachePolicy = {
  key: string;
  ttlSeconds: number;
  requestIfNoneMatch?: string | null;
  cacheControl?: string;
  vary?: string;
  use304?: boolean;
};

type CachePolicy = EnabledCachePolicy | false;

type ProxyCachedOptions = {
  url: string;
  method?: WebProxyMethod;
  body?: unknown;
  timeoutMs?: number;
  extraHeaders?: HeadersInit;
  responseHeaders?: HeadersInit;
  logLabel?: string;
  cache?: CachePolicy;
  authMode?: "web-auth-only" | "client-or-service-token";
  disableTenantHeader?: boolean;
  transformResponse?: (
    payload: unknown,
    context: CachedTransformContext,
  ) => CachedTransformResult | Promise<CachedTransformResult>;
};

type ReadPayloadResult =
  | { kind: "json"; value: unknown }
  | { kind: "text"; value: string }
  | { kind: "empty"; value: null };

function isCacheEnabled(
  cache: CachePolicy | undefined,
): cache is EnabledCachePolicy {
  return cache !== false && cache !== undefined;
}

function buildBody(body: unknown): string | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

function applyJsonContentTypeIfNeeded(headers: Headers, body: unknown): void {
  if (body === undefined || body === null) return;
  if (headers.has("content-type")) return;

  headers.set(
    "content-type",
    typeof body === "string"
      ? "text/plain; charset=utf-8"
      : "application/json",
  );
}

async function readResponsePayload(res: Response): Promise<ReadPayloadResult> {
  const raw = await res.text();

  if (!raw) {
    return { kind: "empty", value: null };
  }

  try {
    return {
      kind: "json",
      value: JSON.parse(raw),
    };
  } catch {
    return {
      kind: "text",
      value: raw,
    };
  }
}

function isHardRefreshFailure(refresh: RefreshResult): boolean {
  const reason = refresh.reason?.toUpperCase() ?? "";

  return (
    refresh.status === 401 ||
    refresh.status === 403 ||
    reason.includes("UNAUTHORIZED") ||
    reason.includes("FORBIDDEN") ||
    reason.includes("INVALID_REFRESH") ||
    reason.includes("BLACKLIST") ||
    reason.includes("REUSE") ||
    reason.includes("DEVICE_MISMATCH")
  );
}

function buildSessionExpiredResponse(
  upstream: Response,
  correlationId: string,
  logLabel: string,
  refresh: RefreshResult,
  req: NextRequest,
): NextResponse {
  const headers = filterProxyResponseHeaders(upstream, []);

  const shouldExpireCookies = isHardRefreshFailure(refresh);

  const expiredCookieCount = shouldExpireCookies
    ? appendSessionExpiredCookies(headers)
    : 0;

  const locale = req.nextUrl.pathname.split("/").filter(Boolean)[0] || "";

  const redirectTo = /^[a-z]{2}(?:-[A-Za-z]{2})?$/i.test(locale)
    ? `/${locale}/auth/login`
    : "/auth/login";

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[BFF][${logLabel}][SESSION_EXPIRED]`, {
      correlationId,
      reason: "RefreshFailed",
      upstreamStatus: upstream.status,
      refreshStatus: refresh.status,
      refreshReason: refresh.reason,
      shouldExpireCookies,
      expiredCookieCount,
    });
  }

  return NextResponse.json(
    {
      ok: false,
      status: 401,
      code: "SESSION_EXPIRED",
      error: "SESSION_EXPIRED",
      message: "auth.sessionExpired",
      userMessage: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      correlationId,
      data: {
        code: "SESSION_EXPIRED",
        reason: "SessionExpired",
        redirectTo,
      },
    },
    {
      status: 401,
      headers,
    },
  );
}

function applyAuthorizationFromRequest(
  req: NextRequest,
  headers: Headers,
): void {
  const auth =
    req.headers.get("authorization") ?? req.headers.get("Authorization");

  if (auth?.trim()) {
    headers.set("authorization", auth.trim());
  }
}

async function buildRequestHeaders(
  req: NextRequest,
  correlationId: string,
  options: {
    extraHeaders?: HeadersInit;
    body?: unknown;
    authMode: "web-auth-only" | "client-or-service-token";
    requestIfNoneMatch?: string | null;
    disableTenantHeader?: boolean;
  },
): Promise<Headers> {
  const headers = buildWebAuthHeaders(req, correlationId, {
    extraHeaders: options.extraHeaders,
    defaultAccept: "application/json",
    includeTenantHeader: !options.disableTenantHeader,
  });

  applyJsonContentTypeIfNeeded(headers, options.body);

  const ifNoneMatch = options.requestIfNoneMatch?.trim();

  if (ifNoneMatch) {
    headers.set("if-none-match", ifNoneMatch);
  }

  if (options.authMode === "client-or-service-token") {
    applyAuthorizationFromRequest(req, headers);

    if (!headers.get("authorization")) {
      const serviceToken = await getServiceToken();

      if (serviceToken?.trim()) {
        headers.set("authorization", `Bearer ${serviceToken.trim()}`);
      }
    }
  }

  return headers;
}

function applyResultHeaders(
  responseHeaders: Headers,
  transformedHeaders?: HeadersInit,
): Headers {
  if (!transformedHeaders) {
    return responseHeaders;
  }

  const extra = new Headers(transformedHeaders);

  extra.forEach((value, key) => {
    responseHeaders.set(key, value);
  });

  return responseHeaders;
}

function applyResponseHeaders(
  responseHeaders: Headers,
  extraHeaders?: HeadersInit,
): Headers {
  if (!extraHeaders) {
    return responseHeaders;
  }

  const extra = new Headers(extraHeaders);

  extra.forEach((value, key) => {
    responseHeaders.set(key, value);
  });

  return responseHeaders;
}

export async function proxyJsonWithWebAuthCached(
  req: NextRequest,
  options: ProxyCachedOptions,
) {
  await ensureBackendTlsReady();

  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? DEFAULT_JSON_TIMEOUT_MS;
  const logLabel = options.logLabel ?? "ProxyJsonWithWebAuthCached";
  const url = resolveBackendUrl(options.url);
  const correlationId = resolveCorrelationId(req);
  const authMode = options.authMode ?? "web-auth-only";
  const cachePolicy = options.cache;

  const requestIfNoneMatch = isCacheEnabled(cachePolicy)
    ? cachePolicy.requestIfNoneMatch?.trim() ||
      req.headers.get("if-none-match") ||
      undefined
    : req.headers.get("if-none-match") || undefined;

  if (process.env.NODE_ENV !== "production") {
    console.info(`[BFF][${logLabel}][IN]`, {
      correlationId,
      method,
      targetUrl: url,
      tenantKey: resolveTenant(req),
      hasCookie: !!req.headers.get("cookie"),
      hasAuthorization: !!req.headers.get("authorization"),
      hasBody: options.body !== undefined && options.body !== null,
      authMode,
      cacheEnabled: isCacheEnabled(cachePolicy),
      timeoutMs,
    });
  }

  if (isCacheEnabled(cachePolicy) && method === "GET") {
    const cached = cacheGet<unknown>(cachePolicy.key);

    if (cached !== undefined && cached !== null) {
      const etag = buildWeakEtag(cached);

      if (process.env.NODE_ENV !== "production") {
        console.info(`[BFF][${logLabel}][CACHE_HIT]`, {
          correlationId,
          cacheKey: cachePolicy.key,
          etag,
        });
      }

      if (
        cachePolicy.use304 !== false &&
        shouldReturnNotModified(requestIfNoneMatch, etag)
      ) {
        return buildNotModifiedResponse({
          correlationId,
          auditLog: "not-modified",
          etag,
          cacheControl: cachePolicy.cacheControl,
          vary: cachePolicy.vary,
        });
      }

      const headers = applyCacheHeaders(new Headers(), {
        correlationId,
        auditLog: "cache-hit",
        etag,
        cacheControl: cachePolicy.cacheControl,
        vary: cachePolicy.vary,
      });

      applyResponseHeaders(headers, options.responseHeaders);

      return NextResponse.json(
        {
          ok: true,
          status: 200,
          data: cached,
          error: null,
        },
        {
          status: 200,
          headers,
        },
      );
    }
  }

  try {
    let headers = await buildRequestHeaders(req, correlationId, {
      extraHeaders: options.extraHeaders,
      body: options.body,
      authMode,
      requestIfNoneMatch,
      disableTenantHeader: options.disableTenantHeader,
    });

    let upstream: Response;
    let retryUsed = false;

    {
      const { signal, cleanup } = withTimeout(timeoutMs);

      try {
        upstream = await fetch(url, {
          method,
          headers,
          body: buildBody(options.body),
          cache: "no-store",
          signal,
        });
      } finally {
        cleanup();
      }
    }

    if (DEBUG_BFF_PROXY) {
      console.info(`[BFF][${logLabel}][UPSTREAM_FIRST]`, {
        correlationId,
        status: upstream.status,
      });
    }

    let refreshCookies: string[] = [];

    if (upstream.status === 401 && authMode === "web-auth-only") {
      const refresh = await tryRefreshWebSession(
        req,
        timeoutMs,
        correlationId,
        logLabel,
      );

      if (!refresh.ok) {
        return buildSessionExpiredResponse(
          upstream,
          correlationId,
          logLabel,
          refresh,
          req,
        );
      }

      refreshCookies = refresh.cookies;
      retryUsed = true;

      headers = buildMergedRetryHeaders(req, correlationId, refreshCookies, {
        extraHeaders: options.extraHeaders,
        defaultAccept: "application/json",
        includeTenantHeader: !options.disableTenantHeader,
      });

      applyJsonContentTypeIfNeeded(headers, options.body);

      if (requestIfNoneMatch) {
        headers.set("if-none-match", requestIfNoneMatch);
      }

      const retryTimeout = withTimeout(timeoutMs);

      try {
        upstream = await fetch(url, {
          method,
          headers,
          body: buildBody(options.body),
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
          refreshCookieCount: refreshCookies.length,
        });
      }

      if (upstream.status === 401) {
        return buildSessionExpiredResponse(
          upstream,
          correlationId,
          logLabel,
          refresh,
          req,
        );
      }
    }

    if (
      upstream.status === 304 &&
      isCacheEnabled(cachePolicy) &&
      method === "GET"
    ) {
      const response = buildNotModifiedResponse({
        correlationId,
        auditLog: "not-modified",
        etag: upstream.headers.get("etag") || requestIfNoneMatch,
        cacheControl:
          upstream.headers.get("cache-control") || cachePolicy.cacheControl,
        vary: upstream.headers.get("vary") || cachePolicy.vary,
      });

      applyResponseHeaders(response.headers, options.responseHeaders);

      return response;
    }

    const responseHeaders = filterProxyResponseHeaders(upstream, refreshCookies);

    if (upstream.status === 204 || upstream.status === 205) {
      applyCacheHeaders(responseHeaders, {
        correlationId,
        cacheControl: isCacheEnabled(cachePolicy)
          ? cachePolicy.cacheControl
          : undefined,
        vary: isCacheEnabled(cachePolicy) ? cachePolicy.vary : undefined,
      });

      applyResponseHeaders(responseHeaders, options.responseHeaders);

      return new NextResponse(null, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    const payload = await readResponsePayload(upstream);

    if (payload.kind === "text") {
      if (!responseHeaders.has("content-type")) {
        responseHeaders.set("content-type", "text/plain; charset=utf-8");
      }

      applyCacheHeaders(responseHeaders, {
        correlationId,
        cacheControl: isCacheEnabled(cachePolicy)
          ? cachePolicy.cacheControl
          : undefined,
        vary: isCacheEnabled(cachePolicy) ? cachePolicy.vary : undefined,
      });

      applyResponseHeaders(responseHeaders, options.responseHeaders);

      return new NextResponse(payload.value, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    if (options.transformResponse) {
      const transformed = await options.transformResponse(payload.value, {
        req,
        correlationId,
        logLabel,
        upstreamStatus: upstream.status,
        retryUsed,
        cacheHit: false,
        requestIfNoneMatch,
      });

      const mergedHeaders = applyResultHeaders(
        responseHeaders,
        transformed.headers,
      );

      applyResponseHeaders(mergedHeaders, options.responseHeaders);

      if (
        isCacheEnabled(cachePolicy) &&
        method === "GET" &&
        upstream.ok &&
        transformed.cache?.enabled !== false
      ) {
        const cacheValue =
          transformed.cache?.value !== undefined
            ? transformed.cache.value
            : transformed.body;

        cacheSet(
          cachePolicy.key,
          cacheValue,
          transformed.cache?.ttlSeconds ?? cachePolicy.ttlSeconds,
        );

        const etag = buildWeakEtag(
          transformed.cache?.etagSource !== undefined
            ? transformed.cache.etagSource
            : cacheValue,
        );

        applyCacheHeaders(mergedHeaders, {
          correlationId,
          auditLog: transformed.cache?.auditLog ?? "success",
          etag,
          cacheControl:
            transformed.cache?.cacheControl ?? cachePolicy.cacheControl,
          vary: transformed.cache?.vary ?? cachePolicy.vary,
        });
      } else {
        applyCacheHeaders(mergedHeaders, {
          correlationId,
          cacheControl: isCacheEnabled(cachePolicy)
            ? cachePolicy.cacheControl
            : undefined,
          vary: isCacheEnabled(cachePolicy) ? cachePolicy.vary : undefined,
        });
      }

      return NextResponse.json(transformed.body, {
        status: transformed.status ?? upstream.status,
        headers: mergedHeaders,
      });
    }

    if (isCacheEnabled(cachePolicy) && method === "GET" && upstream.ok) {
      const cacheValue = payload.value ?? null;

      cacheSet(cachePolicy.key, cacheValue, cachePolicy.ttlSeconds);

      applyCacheHeaders(responseHeaders, {
        correlationId,
        auditLog: "success",
        etag: buildWeakEtag(cacheValue),
        cacheControl: cachePolicy.cacheControl,
        vary: cachePolicy.vary,
      });
    } else {
      applyCacheHeaders(responseHeaders, {
        correlationId,
        cacheControl: isCacheEnabled(cachePolicy)
          ? cachePolicy.cacheControl
          : undefined,
        vary: isCacheEnabled(cachePolicy) ? cachePolicy.vary : undefined,
      });
    }

    applyResponseHeaders(responseHeaders, options.responseHeaders);

    return NextResponse.json(payload.value, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isTimeout = isAbortLikeError(err);

    if (process.env.NODE_ENV !== "production") {
      console.error(`[BFF][${logLabel}][EX]`, {
        correlationId,
        targetUrl: url,
        method,
        error: message,
        timeoutMs,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: isTimeout ? "bff.timeout" : "bff.proxy_error",
        userMessage: isTimeout
          ? "İstek zaman aşımına uğradı."
          : "Beklenmeyen bir hata oluştu.",
        correlationId,
      },
      {
        status: isTimeout ? 504 : 500,
      },
    );
  }
}