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
} from "./webAuthProxyCore";

type ResponseTransformContext = {
  req: NextRequest;
  correlationId: string;
  logLabel: string;
  upstreamStatus: number;
  retryUsed: boolean;
};

type ResponseTransformResult = {
  body: unknown;
  status?: number;
  headers?: HeadersInit;
};

type ProxyOptions = {
  url: string;
  method?: WebProxyMethod;
  body?: unknown;
  timeoutMs?: number;
  extraHeaders?: HeadersInit;
  responseHeaders?: HeadersInit;
  logLabel?: string;
  transformResponse?: (
    payload: unknown,
    context: ResponseTransformContext
  ) => ResponseTransformResult | Promise<ResponseTransformResult>;
};

function applyResponseHeaders(
  target: Headers,
  source?: HeadersInit
): Headers {
  if (!source) {
    return target;
  }

  const extra = new Headers(source);
  extra.forEach((value, key) => {
    target.set(key, value);
  });

  return target;
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
      : "application/json"
  );
}

async function readResponsePayload(
  res: Response
): Promise<
  | { kind: "json"; value: unknown }
  | { kind: "text"; value: string }
  | { kind: "empty"; value: null }
> {
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

function buildSessionExpiredResponse(
  upstream: Response,
  correlationId: string,
  logLabel: string
): NextResponse {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[BFF][${logLabel}][SESSION_EXPIRED]`, {
      correlationId,
      reason: "RefreshFailed",
      upstreamStatus: upstream.status,
    });
  }

  return NextResponse.json(
    {
      ok: false,
      message: "auth.session_expired",
      userMessage: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      correlationId,
      data: {
        reason: "SessionExpired",
        redirectTo: "/login",
      },
    },
    {
      status: 401,
      headers: filterProxyResponseHeaders(upstream, []),
    }
  );
}

export async function proxyJsonWithWebAuth(
  req: NextRequest,
  options: ProxyOptions
) {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? DEFAULT_JSON_TIMEOUT_MS;
  const logLabel = options.logLabel ?? "ProxyJsonWithWebAuth";
  const url = resolveBackendUrl(options.url);
  const correlationId = resolveCorrelationId(req);

  if (process.env.NODE_ENV !== "production") {
    console.info(`[BFF][${logLabel}][IN]`, {
      correlationId,
      method,
      targetUrl: url,
      tenantKey: resolveTenant(req),
      hasCookie: !!req.headers.get("cookie"),
      hasAuthorization: !!req.headers.get("authorization"),
      hasBody: options.body !== undefined && options.body !== null,
      timeoutMs,
    });
  }

  try {
    let headers = buildWebAuthHeaders(req, correlationId, {
      extraHeaders: options.extraHeaders,
      defaultAccept: "application/json",
    });

    applyJsonContentTypeIfNeeded(headers, options.body);

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

    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][UPSTREAM_FIRST]`, {
        correlationId,
        status: upstream.status,
      });
    }

    let refreshCookies: string[] = [];

    if (upstream.status === 401) {
      const refresh = await tryRefreshWebSession(
        req,
        timeoutMs,
        correlationId,
        logLabel
      );

      if (!refresh.ok) {
        return buildSessionExpiredResponse(upstream, correlationId, logLabel);
      }

      refreshCookies = refresh.cookies;
      retryUsed = true;

      headers = buildMergedRetryHeaders(req, correlationId, refreshCookies, {
        extraHeaders: options.extraHeaders,
        defaultAccept: "application/json",
      });

      applyJsonContentTypeIfNeeded(headers, options.body);

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
          retryUsed: true,
          refreshCookieCount: refreshCookies.length,
        });
      }
    }

    const responseHeaders = filterProxyResponseHeaders(upstream, refreshCookies);

    if (upstream.status === 204 || upstream.status === 205) {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[BFF][${logLabel}][OUT]`, {
          correlationId,
          finalStatus: upstream.status,
          payloadKind: "empty",
        });
      }
applyResponseHeaders(responseHeaders, options.responseHeaders);
      return new NextResponse(null, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    const payload = await readResponsePayload(upstream);

    if (process.env.NODE_ENV !== "production") {
      console.info(`[BFF][${logLabel}][OUT]`, {
        correlationId,
        finalStatus: upstream.status,
        payloadKind: payload.kind,
      });
    }

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
        extra.forEach((value, key) => {
          responseHeaders.set(key, value);
        });
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
      { status: isTimeout ? 504 : 500 }
    );
  }
}

