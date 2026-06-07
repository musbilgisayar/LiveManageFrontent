import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_JSON_TIMEOUT_MS,
  WebProxyMethod,
  appendSessionExpiredCookies,
  buildMergedRetryHeaders,
  buildWebAuthHeaders,
  filterProxyResponseHeaders,
  isAbortLikeError,
  resolveBackendUrl,
  resolveCorrelationId,
  shouldProactivelyRefreshAccessToken,
  tryRefreshWebSession,
  withTimeout,
} from "@/lib/bff/webAuthProxyCore";

export type ProxyJsonWithWebAuthOptions = {
  url: string;
  method?: WebProxyMethod;
  body?: unknown;
  headers?: HeadersInit;
  timeoutMs?: number;
  logLabel?: string;
  defaultAccept?: string;
  includeTenantHeader?: boolean;

  /**
   * Türkçe not:
   * Proactive refresh artık global/default çalışmaz.
   * Sadece account/me gibi merkezi session endpointleri true göndermeli.
   */
  enableProactiveRefresh?: boolean;

  /**
   * Türkçe not:
   * Geriye dönük güvenlik anahtarı.
   * true verilirse proactive refresh kesin kapalıdır.
   */
  disableProactiveRefresh?: boolean;

  /**
   * Türkçe not:
   * 401 sonrası refresh + retry kapatılmak istenirse kullanılır.
   */
  disableRetryOn401?: boolean;
};

function isBodyAllowed(method: WebProxyMethod): boolean {
  return method !== "GET" && method !== "HEAD";
}

async function resolveRequestBody(
  req: NextRequest,
  method: WebProxyMethod,
  explicitBody: unknown,
): Promise<BodyInit | undefined> {
  if (!isBodyAllowed(method)) {
    return undefined;
  }

  if (explicitBody !== undefined) {
    return typeof explicitBody === "string"
      ? explicitBody
      : JSON.stringify(explicitBody);
  }

  const contentLength = req.headers.get("content-length");
  const contentType = req.headers.get("content-type");

  if (!contentLength && !contentType) {
    return undefined;
  }

  const text = await req.text();

  return text.length > 0 ? text : undefined;
}

function applyJsonContentType(headers: Headers, body: BodyInit | undefined): void {
  if (!body) return;

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
}

async function readPayloadSafely(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return await response.text().catch(() => null);
  }

  return await response.json().catch(() => null);
}

function isHardRefreshFailure(reason?: string): boolean {
  if (!reason) return false;

  const normalized = reason.toUpperCase();

return [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "SESSION_EXPIRED",
  "REFRESH_FAILED",
  "INVALID_REFRESH_TOKEN",
  "REFRESH_TOKEN_REUSED",
  "TOKEN_REUSE_DETECTED",
  "BLACKLISTED_REFRESH_TOKEN",
  "REFRESH_JTI_BLACKLISTED",
  "USER_BLACKLISTED",
  "USER_TOKEN_BLACKLISTED",
  "DEVICE_MISMATCH",
].some((item) => normalized.includes(item));
}

function createSessionExpiredResponse(
  refreshReason: string | undefined,
  status: number,
  logLabel: string,
  correlationId: string,
): NextResponse {
  const normalizedReason = refreshReason ?? "REFRESH_FAILED";
  const redirectTo = "/login";
  const messageKey = "auth.sessionExpired";
  const fallbackUserMessage = "Oturum süreniz doldu. Lütfen tekrar giriş yapın.";

  const response = NextResponse.json(
    {
      ok: false,
      code: "SESSION_EXPIRED",
      error: "SESSION_EXPIRED",

      // Client/i18n bu key'i çevirmeli
      message: messageKey,
      userMessage: fallbackUserMessage,
      userMessageKey: messageKey,

      reason: normalizedReason,
      redirectTo,
      correlationId,

      data: {
        code: "SESSION_EXPIRED",
        reason: normalizedReason,
        redirectTo,
        messageKey,
        fallbackUserMessage,
      },
    },
    {
      status: status > 0 ? status : 401,
    },
  );

const expiredCookieCount = appendSessionExpiredCookies(response.headers);

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[BFF][${logLabel}][SESSION_EXPIRED_RESPONSE]`, {
      correlationId,
      refreshReason: normalizedReason,
      status,
      expiredCookieCount,
    });
  }

  return response;
}
async function fetchUpstreamJson(
  url: string,
  method: WebProxyMethod,
  headers: Headers,
  body: BodyInit | undefined,
  timeoutMs: number,
): Promise<Response> {
  const { signal, cleanup } = withTimeout(timeoutMs);

  try {
    return await fetch(url, {
      method,
      headers,
      body,
      cache: "no-store",
      signal,
    });
  } finally {
    cleanup();
  }
}

export async function proxyJsonWithWebAuth(
  req: NextRequest,
  options: ProxyJsonWithWebAuthOptions,
): Promise<NextResponse> {
  const method = options.method ?? (req.method as WebProxyMethod);
  const timeoutMs = options.timeoutMs ?? DEFAULT_JSON_TIMEOUT_MS;
  const logLabel = options.logLabel ?? "BFF_JSON_PROXY";
  const correlationId = resolveCorrelationId(req);
  const targetUrl = resolveBackendUrl(options.url);

  const enableProactiveRefresh = options.enableProactiveRefresh === true;
  const skipProactiveRefresh =
    options.disableProactiveRefresh === true || !enableProactiveRefresh;

  const skipRetryOn401 = options.disableRetryOn401 ?? false;

  let refreshCookies: string[] = [];

  try {
    const requestBody = await resolveRequestBody(req, method, options.body);

    let firstHeaders = buildWebAuthHeaders(req, correlationId, {
      extraHeaders: options.headers,
      defaultAccept: options.defaultAccept,
      includeTenantHeader: options.includeTenantHeader,
    });

    applyJsonContentType(firstHeaders, requestBody);

    if (!skipProactiveRefresh && shouldProactivelyRefreshAccessToken(req)) {
      const proactiveRefresh = await tryRefreshWebSession(
        req,
        timeoutMs,
        correlationId,
        `${logLabel}.PROACTIVE`,
      );

      if (proactiveRefresh.ok) {
        refreshCookies = proactiveRefresh.cookies;

        firstHeaders = buildMergedRetryHeaders(
          req,
          correlationId,
          refreshCookies,
          {
            extraHeaders: options.headers,
            defaultAccept: options.defaultAccept,
            includeTenantHeader: options.includeTenantHeader,
          },
        );

        applyJsonContentType(firstHeaders, requestBody);
      }
    }

    let upstream = await fetchUpstreamJson(
      targetUrl,
      method,
      firstHeaders,
      requestBody,
      timeoutMs,
    );

    let retryUsed = false;

    if (upstream.status === 401 && !skipRetryOn401) {
      const retryRefresh = await tryRefreshWebSession(
        req,
        timeoutMs,
        correlationId,
        `${logLabel}.RETRY`,
      );

      if (!retryRefresh.ok) {
        return createSessionExpiredResponse(
          retryRefresh.reason,
          401,
          logLabel,
          correlationId,
        );
      }

      retryUsed = true;
      refreshCookies = retryRefresh.cookies;

      const retryHeaders = buildMergedRetryHeaders(
        req,
        correlationId,
        refreshCookies,
        {
          extraHeaders: options.headers,
          defaultAccept: options.defaultAccept,
          includeTenantHeader: options.includeTenantHeader,
        },
      );

      applyJsonContentType(retryHeaders, requestBody);

      upstream = await fetchUpstreamJson(
        targetUrl,
        method,
        retryHeaders,
        requestBody,
        timeoutMs,
      );
    }

    const responseHeaders = filterProxyResponseHeaders(upstream, refreshCookies);
    const payload = await readPayloadSafely(upstream);

    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][FINAL_RESPONSE]`, {
        correlationId,
        status: upstream.status,
        retryUsed,
        refreshCookieCount: refreshCookies.length,
      });
    }

    return NextResponse.json(payload, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const aborted = isAbortLikeError(error);

    if (process.env.NODE_ENV !== "production") {
      console.error(`[BFF][${logLabel}][ERROR]`, {
        correlationId,
        targetUrl,
        aborted,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: aborted
          ? "İstek zaman aşımına uğradı."
          : "BFF proxy isteği başarısız oldu.",
        userMessage: aborted
          ? "İstek zaman aşımına uğradı. Lütfen tekrar deneyin."
          : "İşlem sırasında beklenmeyen bir hata oluştu.",
        correlationId,
      },
      {
        status: aborted ? 504 : 502,
      },
    );
  }
}