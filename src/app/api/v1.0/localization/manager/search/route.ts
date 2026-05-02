// src/app/api/v1.0/localization/manager/search/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

function resolveCulture(req: NextRequest): string {
  const fromQuery =
    req.nextUrl.searchParams.get("culture")?.trim() ||
    req.nextUrl.searchParams.get("lang")?.trim();

  if (fromQuery) {
    return fromQuery;
  }

  return req.headers.get("accept-language") || "tr";
}

function buildUpstreamPath(req: NextRequest, culture: string): string {
  const upstream = new URL(
    `/api/v${API_VERSION}/${encodeURIComponent(culture)}/localization/manager/search`,
    "http://bff.local"
  );

  const passthroughKeys = ["ns", "contains", "page", "pageSize", "key"];

  for (const key of passthroughKeys) {
    const value = req.nextUrl.searchParams.get(key);
    if (value != null && value !== "") {
      upstream.searchParams.set(key, value);
    }
  }

  return `${upstream.pathname}${upstream.search}`;
}

function normalizeSearchResult(payload: unknown): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      return obj.data;
    }

    if (Array.isArray(obj.items)) {
      return obj.items;
    }
  }

  return [];
}

function createSuccessResponse(payload: unknown) {
  const safePayload =
    payload && typeof payload === "object"
      ? (payload as Record<string, any>)
      : {};

  return {
    ok: true,
    message: safePayload.message ?? "Localization search başarılı.",
    userMessage:
      safePayload.userMessage ?? "Çeviri arama işlemi başarılı.",
    data: normalizeSearchResult(payload),
  };
}

function createErrorResponse(payload: unknown) {
  const safePayload =
    payload && typeof payload === "object"
      ? (payload as Record<string, any>)
      : {};

  return {
    ok: false,
    message:
      safePayload.message ??
      "Localization search sırasında backend hatası oluştu.",
    userMessage:
      safePayload.userMessage ??
      "Çeviri arama işlemi sırasında bir hata oluştu.",
    data: normalizeSearchResult(safePayload.data),
    error: safePayload.error ?? null,
  };
}

export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);
  const culture = resolveCulture(req);
  const url = buildUpstreamPath(req, culture);

  return proxyJsonWithWebAuth(req, {
    url,
    method: "GET",
    timeoutMs: 10_000,
    logLabel: "Localization.Manager.Search.GET",
    transformResponse: (payload, context) => {
      const headers = new Headers();
      headers.set("x-correlation-id", context.correlationId);

      if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
        return {
          body: createSuccessResponse(payload),
          status: 200,
          headers,
        };
      }

      return {
        body: createErrorResponse(payload),
        status: context.upstreamStatus,
        headers,
      };
    },
    responseHeaders: {
      "x-correlation-id": correlationId,
    },
  });
}