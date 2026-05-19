// src/lib/bff/proxyJsonWithWebAuth.ts

import { NextRequest, NextResponse } from "next/server";
import { resolveTenant } from "./resolveTenant";
import {
  DEFAULT_JSON_TIMEOUT_MS,
  type WebProxyMethod,
  resolveBackendUrl,
  resolveCorrelationId,
  withTimeout,
  buildWebAuthHeaders,
  tryRefreshWebSession,
  filterProxyResponseHeaders,
  isAbortLikeError,
  buildMergedRetryHeaders,
  shouldProactivelyRefreshAccessToken,
  type RefreshResult,
} from "./webAuthProxyCore";
import { createLogger } from "./logger";

export type ResponseTransformContext = {
  req: NextRequest;
  correlationId: string;
  logLabel: string;
  upstreamStatus: number;
  retryUsed: boolean;
};

export type ResponseTransformResult = {
  body: unknown;
  status?: number;
  headers?: HeadersInit;
};

export type ProxyJsonOptions = {
  url: string;
  method?: WebProxyMethod;
  body?: unknown;
  timeoutMs?: number;
  extraHeaders?: HeadersInit;
  responseHeaders?: HeadersInit;
  logLabel?: string;
  /** Skip automatic JSON content-type injection */
  skipContentTypeInjection?: boolean;
  /** Disable proactive refresh (for idempotent read-only endpoints) */
  disableProactiveRefresh?: boolean;
  /** Disable retry on 401 (for login endpoints) */
  disableRetryOn401?: boolean;
  /** Omit x-tenant-key for backend endpoints that intentionally support global scope. */
  disableTenantHeader?: boolean;
  transformResponse?: (
    payload: unknown,
    context: ResponseTransformContext
  ) => ResponseTransformResult | Promise<ResponseTransformResult>;
};

export type ProxyJsonResult = Promise<NextResponse>;

type PayloadResult =
  | { kind: "json"; value: unknown }
  | { kind: "text"; value: string }
  | { kind: "empty"; value: null };

function applyResponseHeaders(target: Headers, source?: HeadersInit): Headers {
  if (!source) return target;
  const extra = new Headers(source);
  extra.forEach((value, key) => target.set(key, value));
  return target;
}

function buildBody(body: unknown): string | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
}

function applyJsonContentTypeIfNeeded(headers: Headers, body: unknown, skip: boolean): void {
  if (skip) return;
  if (body === undefined || body === null) return;
  if (headers.has("content-type")) return;

  headers.set(
    "content-type",
    typeof body === "string" ? "text/plain; charset=utf-8" : "application/json"
  );
}

async function readResponsePayload(res: Response): Promise<PayloadResult> {
  const raw = await res.text();
  if (!raw) return { kind: "empty", value: null };

  try {
    return { kind: "json", value: JSON.parse(raw) };
  } catch {
    return { kind: "text", value: raw };
  }
}

function buildSessionExpiredResponse(
  upstream: Response,
  correlationId: string,
  logLabel: string
): NextResponse {
  const logger = createLogger(logLabel, correlationId);
  logger.warn("Session expired - refresh failed", { upstreamStatus: upstream.status });

  return NextResponse.json(
    {
      ok: false,
      message: "auth.session_expired",
      userMessage: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      correlationId,
      data: { reason: "SessionExpired", redirectTo: "/login" },
    },
    { status: 401, headers: filterProxyResponseHeaders(upstream, []) }
  );
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelayMs: number = 100
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

export async function proxyJsonWithWebAuth(
  req: NextRequest,
  options: ProxyJsonOptions
): ProxyJsonResult {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? DEFAULT_JSON_TIMEOUT_MS;
  const logLabel = options.logLabel ?? "ProxyJsonWithWebAuth";
  const url = resolveBackendUrl(options.url);
  const correlationId = resolveCorrelationId(req);
  const logger = createLogger(logLabel, correlationId);

  const skipProactiveRefresh = options.disableProactiveRefresh ?? false;
  const skipRetryOn401 = options.disableRetryOn401 ?? false;

  logger.debug("Request started", {
    method,
    targetUrl: url,
    tenantKey: resolveTenant(req),
    hasCookie: !!req.headers.get("cookie"),
    hasBody: options.body !== undefined,
    timeoutMs,
    skipProactiveRefresh,
    skipRetryOn401,
  });

  try {
    let headers = buildWebAuthHeaders(req, correlationId, {
      extraHeaders: options.extraHeaders,
      defaultAccept: "application/json",
      includeTenantHeader: !options.disableTenantHeader,
    });

    applyJsonContentTypeIfNeeded(headers, options.body, options.skipContentTypeInjection ?? false);

    let upstream: Response;
    let retryUsed = false;
    let refreshCookies: string[] = [];

    // Proactive refresh - token about to expire
    if (!skipProactiveRefresh && shouldProactivelyRefreshAccessToken(req)) {
      const refresh = await executeWithRetry(() =>
        tryRefreshWebSession(req, timeoutMs, correlationId, `${logLabel}.PROACTIVE`)
      );

      if (refresh.ok && refresh.cookies.length > 0) {
        refreshCookies = refresh.cookies;
        headers = buildMergedRetryHeaders(req, correlationId, refreshCookies, {
          extraHeaders: options.extraHeaders,
          defaultAccept: "application/json",
          includeTenantHeader: !options.disableTenantHeader,
        });
        applyJsonContentTypeIfNeeded(headers, options.body, options.skipContentTypeInjection ?? false);

        logger.debug("Proactive refresh applied", { refreshCookieCount: refreshCookies.length });
      } else {
        logger.debug("Proactive refresh skipped - not needed", {
          refreshOk: refresh.ok,
          refreshCookieCount: refresh.cookies.length,
        });
      }
    }

    // Initial request
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

    logger.debug("Upstream first response", { status: upstream.status });

    const alreadyRefreshedProactively = refreshCookies.length > 0;

    // 401 retry with refresh
    if (!skipRetryOn401 && upstream.status === 401 && !alreadyRefreshedProactively) {
      const refresh = await executeWithRetry(() =>
        tryRefreshWebSession(req, timeoutMs, correlationId, logLabel)
      );

      if (!refresh.ok) {
        return buildSessionExpiredResponse(upstream, correlationId, logLabel);
      }

      refreshCookies = refresh.cookies;
      retryUsed = true;

      headers = buildMergedRetryHeaders(req, correlationId, refreshCookies, {
        extraHeaders: options.extraHeaders,
        defaultAccept: "application/json",
        includeTenantHeader: !options.disableTenantHeader,
      });
      applyJsonContentTypeIfNeeded(headers, options.body, options.skipContentTypeInjection ?? false);

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

      logger.debug("Upstream retry response", { status: upstream.status, retryUsed: true });
    }

    const responseHeaders = filterProxyResponseHeaders(upstream, refreshCookies);
    logger.debug("Final response", { retryUsed, refreshCookieCount: refreshCookies.length });

    // No content responses
    if (upstream.status === 204 || upstream.status === 205) {
      applyResponseHeaders(responseHeaders, options.responseHeaders);
      return new NextResponse(null, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    const payload = await readResponsePayload(upstream);
    logger.debug("Response payload read", { kind: payload.kind });

    // Text response (non-JSON)
    if (payload.kind === "text") {
      if (!responseHeaders.has("content-type")) {
        responseHeaders.set("content-type", "text/plain; charset=utf-8");
      }
      applyResponseHeaders(responseHeaders, options.responseHeaders);
      return new NextResponse(payload.value, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    // Apply transformation if provided
    if (options.transformResponse) {
      const transformed = await options.transformResponse(payload.value, {
        req,
        correlationId,
        logLabel,
        upstreamStatus: upstream.status,
        retryUsed,
      });

      if (transformed.headers) {
        const extra = new Headers(transformed.headers);
        extra.forEach((value, key) => responseHeaders.set(key, value));
      }
      applyResponseHeaders(responseHeaders, options.responseHeaders);

      return NextResponse.json(transformed.body, {
        status: transformed.status ?? upstream.status,
        headers: responseHeaders,
      });
    }

    applyResponseHeaders(responseHeaders, options.responseHeaders);
    return NextResponse.json(payload.value, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const isTimeout = isAbortLikeError(err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    logger.error("Proxy error", {
      targetUrl: url,
      method,
      error: errorMessage,
      isTimeout,
      timeoutMs,
    });

    return NextResponse.json(
      {
        ok: false,
        message: isTimeout ? "bff.timeout" : "bff.proxy_error",
        userMessage: isTimeout ? "İstek zaman aşımına uğradı." : "Beklenmeyen bir hata oluştu.",
        correlationId,
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
