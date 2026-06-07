//src/lib/bff/proxyMultipartWithWebAuth.ts
import { NextRequest, NextResponse } from "next/server";

import { createLogger } from "./logger";
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

export type ProxyMultipartOptions = {
  url: string;
  method?: Extract<WebProxyMethod, "POST" | "PUT" | "PATCH">;
  timeoutMs?: number;
  extraHeaders?: HeadersInit;
  responseHeaders?: HeadersInit;
  logLabel?: string;

  /**
   * Türkçe not:
   * Multipart/upload işlemlerinde proactive refresh default kapalıdır.
   * Upload başlamadan refresh yapmak JTI race riskini artırır.
   */
  enableProactiveRefresh?: boolean;

  disableProactiveRefresh?: boolean;
  disableRetryOn401?: boolean;
};

function applyResponseHeaders(target: Headers, source?: HeadersInit): Headers {
  if (!source) return target;

  const extra = new Headers(source);

  extra.forEach((value, key) => {
    target.set(key, value);
  });

  return target;
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

function buildMultipartHeaders(
  req: NextRequest,
  correlationId: string,
  refreshCookies: string[],
  options: ProxyMultipartOptions,
): Headers {
  const headerOptions = {
    extraHeaders: options.extraHeaders,
    defaultAccept: "application/json",
  };

  if (refreshCookies.length > 0) {
    return buildMergedRetryHeaders(
      req,
      correlationId,
      refreshCookies,
      headerOptions,
    );
  }

  return buildWebAuthHeaders(req, correlationId, headerOptions);
}

function buildSessionExpiredResponse(params: {
  upstream: Response;
  correlationId: string;
  logLabel: string;
  refresh: RefreshResult;
}): NextResponse {
  const { upstream, correlationId, logLabel, refresh } = params;
  const logger = createLogger(logLabel, correlationId);
  const headers = filterProxyResponseHeaders(upstream, []);

  const shouldExpireCookies = isHardRefreshFailure(refresh);

  const expiredCookieCount = shouldExpireCookies
    ? appendSessionExpiredCookies(headers)
    : 0;

  logger.warn("Multipart refresh failed", {
    upstreamStatus: upstream.status,
    refreshStatus: refresh.status,
    refreshReason: refresh.reason,
    shouldExpireCookies,
    expiredCookieCount,
    finalStatus: 401,
  });

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
        reason: refresh.reason ?? "SessionExpired",
      },
    },
    { status: 401, headers },
  );
}

async function fetchMultipart(
  targetUrl: string,
  method: string,
  headers: Headers,
  formData: FormData,
  timeoutMs: number,
): Promise<Response> {
  const { signal, cleanup } = withTimeout(timeoutMs);

  try {
    return await fetch(targetUrl, {
      method,
      headers,
      body: formData,
      cache: "no-store",
      signal,
    });
  } finally {
    cleanup();
  }
}

export async function proxyMultipartWithWebAuth(
  req: NextRequest,
  options: ProxyMultipartOptions,
): Promise<NextResponse> {
  const method = options.method ?? "POST";
  const timeoutMs = options.timeoutMs ?? DEFAULT_JSON_TIMEOUT_MS;
  const logLabel = options.logLabel ?? "ProxyMultipartWithWebAuth";
  const targetUrl = resolveBackendUrl(options.url);
  const correlationId = resolveCorrelationId(req);
  const logger = createLogger(logLabel, correlationId);

  const enableProactiveRefresh = options.enableProactiveRefresh === true;
  const skipProactiveRefresh =
    options.disableProactiveRefresh === true || !enableProactiveRefresh;

  const skipRetryOn401 = options.disableRetryOn401 ?? false;

  logger.debug("Multipart request started", {
    method,
    targetUrl,
    tenantKey: resolveTenant(req),
    hasCookie: !!req.headers.get("cookie"),
    contentType: req.headers.get("content-type"),
    enableProactiveRefresh,
    skipProactiveRefresh,
    skipRetryOn401,
    timeoutMs,
  });

  try {
    const formData = await req.formData();

    let refreshCookies: string[] = [];
    let retryUsed = false;

    /**
     * Türkçe not:
     * Proactive refresh multipart işlemlerde default kapalıdır.
     * Normal akış: önce upload denenir, 401 gelirse tek refresh + retry yapılır.
     */
    if (!skipProactiveRefresh) {
      logger.debug("Multipart proactive refresh intentionally skipped by policy", {
        enableProactiveRefresh,
      });
    }

    let headers = buildMultipartHeaders(
      req,
      correlationId,
      refreshCookies,
      options,
    );

    let upstream = await fetchMultipart(
      targetUrl,
      method,
      headers,
      formData,
      timeoutMs,
    );

    logger.debug("Multipart upstream first response", {
      status: upstream.status,
    });

    if (!skipRetryOn401 && upstream.status === 401) {
      const refresh = await tryRefreshWebSession(
        req,
        timeoutMs,
        correlationId,
        `${logLabel}.RETRY`,
      );

      if (!refresh.ok) {
        return buildSessionExpiredResponse({
          upstream,
          correlationId,
          logLabel,
          refresh,
        });
      }

      refreshCookies = refresh.cookies;
      retryUsed = true;

      headers = buildMultipartHeaders(req, correlationId, refreshCookies, options);

      upstream = await fetchMultipart(
        targetUrl,
        method,
        headers,
        formData,
        timeoutMs,
      );

      logger.debug("Multipart upstream retry response", {
        status: upstream.status,
        retryUsed,
        refreshCookieCount: refreshCookies.length,
      });

      if (upstream.status === 401) {
        return buildSessionExpiredResponse({
          upstream,
          correlationId,
          logLabel,
          refresh,
        });
      }
    }

    const responseHeaders = filterProxyResponseHeaders(upstream, refreshCookies);
    applyResponseHeaders(responseHeaders, options.responseHeaders);

    if (upstream.status === 204 || upstream.status === 205) {
      return new NextResponse(null, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    const contentType = upstream.headers.get("content-type");

    if (contentType && !responseHeaders.has("content-type")) {
      responseHeaders.set("content-type", contentType);
    }

    const body = await upstream.arrayBuffer();

    logger.debug("Multipart response complete", {
      status: upstream.status,
      retryUsed,
      byteLength: body.byteLength,
      contentType,
    });

    return new NextResponse(body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const isTimeout = isAbortLikeError(error);
    const message = error instanceof Error ? error.message : "Unknown error";

    logger.error("Multipart proxy error", {
      targetUrl,
      method,
      error: message,
      isTimeout,
      timeoutMs,
    });

    return NextResponse.json(
      {
        ok: false,
        message: isTimeout ? "bff.timeout" : "bff.multipart_proxy_error",
        userMessage: isTimeout
          ? "İstek zaman aşımına uğradı."
          : "Dosya yükleme isteği işlenemedi.",
        correlationId,
      },
      { status: isTimeout ? 504 : 500 },
    );
  }
}