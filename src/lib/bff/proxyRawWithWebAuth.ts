// src/lib/bff/proxyRawWithWebAuth.ts

import { NextRequest, NextResponse } from "next/server";
import { resolveTenant } from "./resolveTenant";
import {
  DEFAULT_RAW_TIMEOUT_MS,
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
  extractSetCookies,
  mergeCookie,
} from "./webAuthProxyCore";
import { createLogger } from "./logger";

export type ProxyRawOptions = {
  url: string;
  method?: WebProxyMethod;
  body?: BodyInit | null;
  timeoutMs?: number;
  extraHeaders?: HeadersInit;
  responseHeaders?: HeadersInit;
  logLabel?: string;
  /** Disable proactive refresh for this request */
  disableProactiveRefresh?: boolean;
  /** Disable retry on 401 */
  disableRetryOn401?: boolean;
  /** Stream response instead of buffering (for large files) */
  streamResponse?: boolean;
};

export type ProxyRawResult = Promise<NextResponse>;

const MAX_BUFFER_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

function shouldForwardContentType(body: BodyInit | null | undefined): boolean {
  if (body === undefined || body === null) return false;
  if (body instanceof FormData) return false;
  if (body instanceof URLSearchParams) return false;
  return true;
}

function getBodySize(body: BodyInit | null | undefined): number | null {
  if (!body) return null;
  if (typeof body === "string") return Buffer.byteLength(body, "utf8");
  if (body instanceof ArrayBuffer) return body.byteLength;
  if (body instanceof Blob) return body.size;
  if (body instanceof Buffer) return body.length;
  if (body instanceof ReadableStream) return null; // Cannot determine
  return null;
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

function shouldSkipBufferLimit(contentType: string): boolean {
  const skipPatterns = ["video/", "audio/", "application/zip", "application/x-tar", "application/x-gzip"];
  return skipPatterns.some((pattern) => contentType.includes(pattern));
}

async function readStreamToBuffer(stream: ReadableStream<Uint8Array>, contentType: string): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  try {
    const shouldLimit = !shouldSkipBufferLimit(contentType);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        totalSize += value.length;
        if (shouldLimit && totalSize > MAX_BUFFER_SIZE_BYTES) {
          throw new Error(`Response exceeds buffer limit: ${totalSize} > ${MAX_BUFFER_SIZE_BYTES}`);
        }
        chunks.push(value);
      }
    }

    const combined = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    return combined.buffer;
  } finally {
    reader.releaseLock();
  }
}

export async function proxyRawWithWebAuth(
  req: NextRequest,
  options: ProxyRawOptions
): ProxyRawResult {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? DEFAULT_RAW_TIMEOUT_MS;
  const logLabel = options.logLabel ?? "ProxyRawWithWebAuth";
  const targetUrl = resolveBackendUrl(options.url);
  const correlationId = resolveCorrelationId(req);
  const logger = createLogger(logLabel, correlationId);

  const skipProactiveRefresh = options.disableProactiveRefresh ?? false;
  const skipRetryOn401 = options.disableRetryOn401 ?? false;

  const bodySize = getBodySize(options.body);
  logger.debug("Request started", {
    method,
    targetUrl,
    tenantKey: resolveTenant(req),
    hasCookie: !!req.headers.get("cookie"),
    hasBody: options.body !== undefined && options.body !== null,
    bodySize: bodySize ? `${bodySize} bytes` : "unknown",
    timeoutMs,
    skipProactiveRefresh,
    skipRetryOn401,
    streamResponse: options.streamResponse,
  });

  try {
    let headers = buildWebAuthHeaders(req, correlationId, {
      extraHeaders: options.extraHeaders,
      defaultAccept: "*/*", // Accept anything for raw endpoints
      includeAuthorization: true,
    });

    // Forward content-type only for non-multipart bodies
    if (shouldForwardContentType(options.body) && req.headers.get("content-type")) {
      headers.set("content-type", req.headers.get("content-type")!);
    }

    let upstream: Response;
    let retryUsed = false;
    let refreshCookies: string[] = [];

    // Proactive refresh for long-running raw operations (uploads/downloads)
    if (!skipProactiveRefresh && shouldProactivelyRefreshAccessToken(req)) {
      const refresh = await executeWithRetry(() =>
        tryRefreshWebSession(req, timeoutMs, correlationId, `${logLabel}.PROACTIVE`)
      );

      if (refresh.ok && refresh.cookies.length > 0) {
        refreshCookies = refresh.cookies;
        headers = buildMergedRetryHeaders(req, correlationId, refreshCookies, {
          extraHeaders: options.extraHeaders,
          defaultAccept: "*/*",
        });

        if (shouldForwardContentType(options.body) && req.headers.get("content-type")) {
          headers.set("content-type", req.headers.get("content-type")!);
        }

        logger.debug("Proactive refresh applied", { refreshCookieCount: refreshCookies.length });
      }
    }

    // Initial request
    {
      const { signal, cleanup } = withTimeout(timeoutMs);
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
    }

    logger.debug("Upstream first response", { status: upstream.status });

    const alreadyRefreshedProactively = refreshCookies.length > 0;

    // 401 retry with refresh
    if (!skipRetryOn401 && upstream.status === 401 && !alreadyRefreshedProactively) {
      const refresh = await executeWithRetry(() =>
        tryRefreshWebSession(req, timeoutMs, correlationId, logLabel)
      );

      if (!refresh.ok) {
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

      refreshCookies = refresh.cookies;
      retryUsed = true;

      headers = buildMergedRetryHeaders(req, correlationId, refreshCookies, {
        extraHeaders: options.extraHeaders,
        defaultAccept: "*/*",
      });

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

      logger.debug("Upstream retry response", { status: upstream.status, retryUsed: true });
    }

    const responseHeaders = filterProxyResponseHeaders(upstream, refreshCookies);
    logger.debug("Final response", { retryUsed, refreshCookieCount: refreshCookies.length });

    // No content responses
    if (upstream.status === 204 || upstream.status === 205) {
      if (options.responseHeaders) {
        const extra = new Headers(options.responseHeaders);
        extra.forEach((value, key) => responseHeaders.set(key, value));
      }
      return new NextResponse(null, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    if (!responseHeaders.has("content-type") && contentType) {
      responseHeaders.set("content-type", contentType);
    }

    if (options.responseHeaders) {
      const extra = new Headers(options.responseHeaders);
      extra.forEach((value, key) => responseHeaders.set(key, value));
    }

    // Streaming response for large files
    if (options.streamResponse && upstream.body) {
      logger.debug("Streaming response", { contentType });
      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
      });
    }

    // Buffered response (default)
    const arrayBuffer = await readStreamToBuffer(upstream.body!, contentType);

    logger.debug("Response complete", {
      status: upstream.status,
      contentType,
      byteLength: arrayBuffer.byteLength,
    });

    return new NextResponse(arrayBuffer, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const isTimeout = isAbortLikeError(err);
    const isBufferOverflow = err instanceof Error && err.message.includes("exceeds buffer limit");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    logger.error("Proxy raw error", {
      targetUrl,
      method,
      error: errorMessage,
      isTimeout,
      isBufferOverflow,
      timeoutMs,
    });

    const status = isTimeout ? 504 : isBufferOverflow ? 413 : 500;
    const message = isTimeout ? "bff.timeout" : isBufferOverflow ? "bff.response_too_large" : "bff.proxy_error";
    const userMessage = isTimeout
      ? "İstek zaman aşımına uğradı."
      : isBufferOverflow
        ? "Yanıt çok büyük."
        : "Beklenmeyen bir hata oluştu.";

    return NextResponse.json(
      {
        ok: false,
        message,
        userMessage,
        correlationId,
      },
      { status }
    );
  }
}