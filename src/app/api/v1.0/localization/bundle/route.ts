// src/app/api/v1.0/localization/bundle/route.ts
export const runtime = "nodejs";

/**
 * localization/bundle BFF route
 * --------------------------------------------------------------------------
 * Bu route i18n için ANA/PUBLIC giriş noktası değildir.
 *
 * Roller:
 * - /api/i18n/[lang]/dict  -> ana/public giriş
 * - /api/v1.0/localization/bundle -> internal provider/cache katmanı
 * - /api/v1.0/[lang]/localization/strings -> yardımcı adapter
 *
 * Bu route'un görevi:
 * - backend localization bundle endpoint'ine gitmek
 * - auth / tenant / language bilgilerini taşımak
 * - kısa süreli BFF cache uygulamak
 * - ETag / 304 davranışını desteklemek
 * - tek namespace bundle verisini döndürmek
 *
 * Not:
 * Frontend doğrudan bunu ana i18n kapısı gibi kullanmamalıdır.
 * Bu route esas olarak dict route'unun iç kaynağı gibi düşünülmelidir.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  authHash,
  BACKEND_BASE,
  buildBackendUrl,
  cacheGet,
  cacheSet,
  fetchWithTimeout,
  newCorrelationId,
  parseJsonSafe,
  pickClientAuth,
  resolveAcceptLanguage,
  resolveLangSegment,
  resolveTenantKey,
} from "@/app/api/_shared/bff";

const CACHE_TTL_SECONDS = 30;
const VARY_HEADER = "Accept-Language, Authorization, X-Tenant-Key";

/**
 * BFF response zarfı.
 */
type ApiEnvelope<T> = {
  ok: boolean;
  status: number;
  data: T;
  error: string | null;
};

type BundleData = Record<string, string>;

type FetchBundleResult =
  | {
      kind: "ok";
      status: number;
      bundle: BundleData;
      etag: string;
      cacheControl: string;
    }
  | {
      kind: "not-modified";
      etag: string;
      cacheControl: string;
    }
  | {
      kind: "upstream-error";
      upstreamStatus: number;
      payload: unknown;
    };

/**
 * Aynı cache key için aynı anda gelen istekleri tek upstream çağrı altında toplar.
 */
const inflightRequests = new Map<string, Promise<FetchBundleResult>>();

/**
 * İstekten culture parametresini çözer.
 * Yoksa Accept-Language kullanılır.
 */
function normalizeCulture(req: NextRequest): string {
  const raw =
    req.nextUrl.searchParams.get("culture")?.trim() ||
    resolveAcceptLanguage(req);

  const lowered = (raw || "tr-TR").trim().toLowerCase();

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

/**
 * Namespace parametresini çözer.
 */
function normalizeNamespace(req: NextRequest): string {
  return req.nextUrl.searchParams.get("ns")?.trim() || "common";
}

/**
 * Format parametresini çözer.
 */
function normalizeFormat(req: NextRequest): string {
  return req.nextUrl.searchParams.get("format")?.trim() || "full";
}

/**
 * Gövdeden stabil bir ETag üretir.
 */
function etagFor(value: unknown): string {
  try {
    const text = JSON.stringify(value);
    const hash = crypto
      .createHash("sha1")
      .update(text)
      .digest("base64url")
      .slice(0, 16);

    return `"lm-${hash}"`;
  } catch {
    return `"lm-${crypto.randomUUID()}"`;
  }
}

/**
 * Backend payload'ından bundle datasını normalize eder.
 *
 * Olası şekiller:
 * - { data: {...} }
 * - { items: {...} }
 * - direkt {...}
 */
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

/**
 * Cache anahtarını tenant + dil + culture + namespace + format + auth bazında üretir.
 */
function buildCacheKey(req: NextRequest, tenantKey: string): string {
  const langSeg = resolveLangSegment(req);
  const culture = normalizeCulture(req);
  const ns = normalizeNamespace(req);
  const format = normalizeFormat(req);
  const authHeader = pickClientAuth(req)?.header ?? "";

  return [
    "localization:bundle",
    tenantKey,
    langSeg,
    culture,
    ns,
    format,
    `auth:${authHash(authHeader)}`,
  ].join(":");
}

/**
 * Standart JSON response helper.
 */
function jsonResponse<T>(
  body: ApiEnvelope<T>,
  init?: ResponseInit
): NextResponse<ApiEnvelope<T>> {
  return NextResponse.json(body, init);
}

/**
 * Upstream localization bundle çağrısını yapar.
 */
async function fetchBundleFromUpstream(params: {
  req: NextRequest;
  corrId: string;
  tenantKey: string;
  acceptLanguage: string;
  etagIn?: string;
  upstreamUrl: string;
  auth: { header: string; source: string } | null;
}): Promise<FetchBundleResult> {
  const {
    req,
    corrId,
    tenantKey,
    acceptLanguage,
    etagIn,
    upstreamUrl,
    auth,
  } = params;

  const upstreamHeaders: Record<string, string> = {
    accept: "application/json",
    "x-correlation-id": corrId,
    "accept-language": acceptLanguage,
    "x-tenant-key": tenantKey,
  };

  if (etagIn) {
    upstreamHeaders["if-none-match"] = etagIn;
  }

  if (auth) {
    upstreamHeaders.authorization = auth.header;
  }

  const upstream = await fetchWithTimeout(
    upstreamUrl,
    {
      method: "GET",
      headers: upstreamHeaders,
      cache: "no-store",
    },
    10_000
  );

  if (upstream.status === 304) {
    return {
      kind: "not-modified",
      etag: upstream.headers.get("etag") ?? etagIn ?? `"lm-${crypto.randomUUID()}"`,
      cacheControl: upstream.headers.get("cache-control") ?? "public, max-age=300",
    };
  }

  const payload = await parseJsonSafe(upstream);

  if (!upstream.ok) {
    console.warn("⚠️ [BFF localization/bundle] Upstream başarısız", {
      corrId,
      tenantKey,
      path: req.nextUrl.pathname,
      search: req.nextUrl.search,
      status: upstream.status,
      payload,
    });

    return {
      kind: "upstream-error",
      upstreamStatus: upstream.status,
      payload,
    };
  }

  const bundle = normalizeBundlePayload(payload);

  return {
    kind: "ok",
    status: upstream.status,
    bundle,
    etag: upstream.headers.get("etag") ?? etagFor(bundle),
    cacheControl: upstream.headers.get("cache-control") ?? "public, max-age=300",
  };
}

/**
 * Aynı cache key için tek inflight promise kullanır.
 */
async function getOrCreateInflight(
  cacheKey: string,
  factory: () => Promise<FetchBundleResult>
): Promise<FetchBundleResult> {
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
  const corrId = newCorrelationId(req.headers);
  const { tenantKey } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(req);
  const cacheKey = buildCacheKey(req, tenantKey);
  const auth = pickClientAuth(req);

  /**
   * Internal provider route olduğu için backend'in gerçek localization bundle
   * endpoint'ine gider.
   */
  const upstreamUrl = `${buildBackendUrl("/api/v1.0/localization/bundle")}${req.nextUrl.search}`;
  const etagIn = req.headers.get("if-none-match") || undefined;

  console.group("🟦 [BFF localization/bundle]");
  console.log("➡️ Internal provider başladı", {
    corrId,
    tenantKey,
    acceptLanguage,
    cacheKey,
    authSource: auth?.source ?? "none",
    hasAuth: !!auth,
    upstreamUrl,
    backendBase: BACKEND_BASE,
  });

  /**
   * Önce process cache kontrolü
   */
  const cached = cacheGet<BundleData>(cacheKey);
  if (cached) {
    const etag = etagFor(cached);

    console.log("🟨 [BFF localization/bundle] CACHE HIT", {
      corrId,
      cacheKey,
      keyCount: Object.keys(cached).length,
    });
    console.groupEnd();

    if (etagIn && etagIn === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "not-modified",
          ETag: etag,
          "Cache-Control": "public, max-age=30",
          Vary: VARY_HEADER,
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
          "x-correlation-id": corrId,
          "x-audit-log": "cache-hit",
          ETag: etag,
          "Cache-Control": "public, max-age=30",
          Vary: VARY_HEADER,
        },
      }
    );
  }

  try {
    const result = await getOrCreateInflight(cacheKey, async () => {
      const upstreamResult = await fetchBundleFromUpstream({
        req,
        corrId,
        tenantKey,
        acceptLanguage,
        etagIn,
        upstreamUrl,
        auth,
      });

      if (upstreamResult.kind === "ok") {
        cacheSet(cacheKey, upstreamResult.bundle, CACHE_TTL_SECONDS);
      }

      return upstreamResult;
    });

    if (result.kind === "not-modified") {
      console.log("🟪 [BFF localization/bundle] 304 not modified", {
        corrId,
        cacheKey,
      });
      console.groupEnd();

      return new NextResponse(null, {
        status: 304,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "not-modified",
          ETag: result.etag,
          "Cache-Control": result.cacheControl,
          Vary: VARY_HEADER,
        },
      });
    }

    if (result.kind === "upstream-error") {
      console.warn("🟥 [BFF localization/bundle] Upstream error", {
        corrId,
        cacheKey,
        upstreamStatus: result.upstreamStatus,
      });
      console.groupEnd();

      /**
       * Mevcut sistem davranışı ile uyumlu kalmak için body-level envelope + 200 dönüyoruz.
       * Error semantics ileride merkezileşirse yeniden ele alınabilir.
       */
      return jsonResponse<BundleData>(
        {
          ok: false,
          status: result.upstreamStatus,
          data: {},
          error: "UPSTREAM_NOT_OK",
        },
        {
          status: 200,
          headers: {
            "x-correlation-id": corrId,
            "x-audit-log": "failed",
            Vary: VARY_HEADER,
          },
        }
      );
    }

    console.log("✅ [BFF localization/bundle] Success", {
      corrId,
      cacheKey,
      status: result.status,
      keyCount: Object.keys(result.bundle).length,
    });
    console.groupEnd();

    return jsonResponse<BundleData>(
      {
        ok: true,
        status: result.status,
        data: result.bundle,
        error: null,
      },
      {
        status: 200,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "success",
          ETag: result.etag,
          "Cache-Control": result.cacheControl,
          Vary: VARY_HEADER,
        },
      }
    );
  } catch (error: unknown) {
    console.warn("💥 [BFF localization/bundle] Exception", {
      corrId,
      tenantKey,
      error: error instanceof Error ? error.message : String(error),
    });
    console.groupEnd();

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
          "x-correlation-id": corrId,
          "x-audit-log": "exception",
          Vary: VARY_HEADER,
        },
      }
    );
  }
}