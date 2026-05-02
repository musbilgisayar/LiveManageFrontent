// src/lib/bff/httpCache.ts

import "server-only";
import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const DEFAULT_PRIVATE_CACHE_CONTROL = "private, max-age=10";
export const DEFAULT_VARY_HEADER = "Accept-Language, Authorization";

export type CacheHeadersOptions = {
  etag?: string | null;
  cacheControl?: string | null;
  vary?: string | null;
  correlationId?: string | null;
  auditLog?: string | null;
};

export function buildWeakEtag(value: unknown, prefix = "lm"): string {
  try {
    const text = JSON.stringify(value);
    const hash = crypto
      .createHash("sha1")
      .update(text)
      .digest("base64url")
      .slice(0, 16);

    return `"${prefix}-${hash}"`;
  } catch {
    return `"${prefix}-${crypto.randomUUID()}"`;
  }
}

export function normalizeCacheControl(value?: string | null): string {
  return value?.trim() || DEFAULT_PRIVATE_CACHE_CONTROL;
}

export function normalizeVary(value?: string | null): string {
  return value?.trim() || DEFAULT_VARY_HEADER;
}

export function applyCacheHeaders(
  headers: Headers,
  options?: CacheHeadersOptions
): Headers {
  if (!options) {
    return headers;
  }

  const etag = options.etag?.trim();
  const cacheControl = normalizeCacheControl(options.cacheControl);
  const vary = normalizeVary(options.vary);
  const correlationId = options.correlationId?.trim();
  const auditLog = options.auditLog?.trim();

  if (etag) {
    headers.set("etag", etag);
  }

  headers.set("cache-control", cacheControl);
  headers.set("vary", vary);

  if (correlationId) {
    headers.set("x-correlation-id", correlationId);
  }

  if (auditLog) {
    headers.set("x-audit-log", auditLog);
  }

  return headers;
}

export function buildNotModifiedResponse(options?: CacheHeadersOptions) {
  const headers = applyCacheHeaders(new Headers(), options);

  return new NextResponse(null, {
    status: 304,
    headers,
  });
}

export function shouldReturnNotModified(
  requestIfNoneMatch?: string | null,
  currentEtag?: string | null
): boolean {
  const candidate = requestIfNoneMatch?.trim();
  const etag = currentEtag?.trim();

  if (!candidate || !etag) {
    return false;
  }

  return candidate === etag;
}