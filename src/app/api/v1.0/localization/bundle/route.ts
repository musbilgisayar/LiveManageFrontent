// src/app/api/v1.0/localization/bundle/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/app/api/_shared/bff";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";
import { proxyJsonWithWebAuthCached } from "@/lib/bff/proxyJsonWithWebAuthCached";
import { buildWeakEtag } from "@/lib/bff/httpCache";
import { buildUserScopedCacheKey } from "@/lib/bff/userScopedCache";
import { resolveTenant } from "@/lib/bff/resolveTenant";

const CACHE_TTL_SECONDS = 30;
const VARY_HEADER = "Accept-Language, Authorization, X-Tenant-Key";

type ApiEnvelope<T> = {
  ok: boolean;
  status: number;
  data: T;
  error: string | null;
};

type BundleData = Record<string, string>;

const inflightRequests = new Map<string, Promise<Response>>();

function normalizeCulture(req: NextRequest): string {
  const raw =
    req.nextUrl.searchParams.get("culture")?.trim() ||
    req.headers.get("accept-language") ||
    "tr-TR";

  const lowered = raw.trim().toLowerCase();

  switch (lowered) {
    case "tr":
    case "tr-tr":
      return "tr-TR";
    case "en":
    case "en-us":
      return "en-US";
    case "de":
    case "de-de":
      return "de-DE";
    case "fr":
    case "fr-fr":
      return "fr-FR";
    case "it":
    case "it-it":
      return "it-IT";
    case "ar":
    case "ar-sa":
      return "ar-SA";
    default:
      return "tr-TR";
  }
}

function normalizeNamespace(req: NextRequest): string {
  return req.nextUrl.searchParams.get("ns")?.trim() || "common";
}

function normalizeFormat(req: NextRequest): string {
  return req.nextUrl.searchParams.get("format")?.trim() || "full";
}

function normalizeBundlePayload(payload: unknown): BundleData {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const candidate = payload as Record<string, unknown>;

  if (
    candidate.data &&
    typeof candidate.data === "object" &&
    !Array.isArray(candidate.data)
  ) {
    return candidate.data as BundleData;
  }

  if (
    candidate.items &&
    typeof candidate.items === "object" &&
    !Array.isArray(candidate.items)
  ) {
    return candidate.items as BundleData;
  }

  return candidate as BundleData;
}

function buildInternalCacheKey(req: NextRequest): string {
  const tenantKey = resolveTenant(req);
  const culture = normalizeCulture(req);
  const ns = normalizeNamespace(req);
  const format = normalizeFormat(req);

  const userScoped = buildUserScopedCacheKey({
    namespace: "localization:bundle",
    req,
    languageSegment: culture,
    includeCookieHeader: false,
  });

  return [userScoped, tenantKey, culture, ns, format].join(":");
}

function jsonResponse<T>(
  body: ApiEnvelope<T>,
  init?: ResponseInit
): NextResponse<ApiEnvelope<T>> {
  return NextResponse.json(body, init);
}

async function getOrCreateInflight(
  cacheKey: string,
  factory: () => Promise<Response>
): Promise<Response> {
  const existing = inflightRequests.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = factory().finally(() => {
    inflightRequests.delete(cacheKey);
  });

  inflightRequests.set(cacheKey, promise);
  return promise;
}

export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);
  const cacheKey = buildInternalCacheKey(req);
  const etagIn = req.headers.get("if-none-match") || undefined;

  const cached = cacheGet<BundleData>(cacheKey);
  if (cached) {
    const etag = buildWeakEtag(cached);

    if (etagIn && etagIn === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "x-correlation-id": correlationId,
          "x-audit-log": "not-modified",
          etag,
          "cache-control": "public, max-age=30",
          vary: VARY_HEADER,
        },
      });
    }

    return jsonResponse<BundleData>(
      {
        ok: true,
        status: 200,
        data: cached,
        error: null,
      },
      {
        status: 200,
        headers: {
          "x-correlation-id": correlationId,
          "x-audit-log": "cache-hit",
          etag,
          "cache-control": "public, max-age=30",
          vary: VARY_HEADER,
        },
      }
    );
  }

  return getOrCreateInflight(cacheKey, async () => {
    const response = await proxyJsonWithWebAuthCached(req, {
      url: `/api/v1.0/localization/bundle${req.nextUrl.search}`,
      method: "GET",
      timeoutMs: 10_000,
      logLabel: "Localization.Bundle.GET",
      cache: false,
      transformResponse: (payload, context) => {
        const headers = new Headers();
        headers.set("x-correlation-id", context.correlationId);
        headers.set("vary", VARY_HEADER);

        if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
          const bundle = normalizeBundlePayload(payload);
          cacheSet(cacheKey, bundle, CACHE_TTL_SECONDS);

          headers.set("x-audit-log", "success");
          headers.set("etag", buildWeakEtag(bundle));
          headers.set("cache-control", "public, max-age=30");

          return {
            body: {
              ok: true,
              status: context.upstreamStatus,
              data: bundle,
              error: null,
            },
            status: 200,
            headers,
            cache: {
              enabled: false,
            },
          };
        }

        headers.set("x-audit-log", "failed");

        return {
          body: {
            ok: false,
            status: context.upstreamStatus,
            data: {},
            error: "UPSTREAM_NOT_OK",
          },
          status: 200,
          headers,
          cache: {
            enabled: false,
          },
        };
      },
      responseHeaders: {
        vary: VARY_HEADER,
      },
    });

    return response;
  }).catch((error: unknown) => {
    return jsonResponse<BundleData>(
      {
        ok: false,
        status: 0,
        data: {},
        error: "FETCH_FAILED",
      },
      {
        status: 200,
        headers: {
          "x-correlation-id": correlationId,
          "x-audit-log": "exception",
          vary: VARY_HEADER,
        },
      }
    );
  });
}