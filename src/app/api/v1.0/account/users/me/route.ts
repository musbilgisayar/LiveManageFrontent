// src/app/api/v1.0/account/users/me/route.ts
export const runtime = "nodejs";

/**
 * account/users/me BFF route
 * -----------------------------------------------------------------------------
 * Bu route, web frontend tarafında kullanıcının kendi profil bilgisini okumak
 * ve güncellemek için standart BFF giriş kapısıdır.
 *
 * Route rolü:
 * - Frontend public/BFF kapısıdır
 * - Backend'deki gerçek endpoint: /api/v1.0/account/me
 *
 * Sorumluluklar:
 * - web auth sinyalini request'ten çözmek
 * - tenant / dil / correlation id taşımak
 * - backend /account/me endpoint'ine proxy olmak
 * - kısa süreli process cache uygulamak
 * - PATCH sonrası ilgili cache'i temizlemek
 *
 * Web auth standardı:
 * - cookie + BFF refresh + session/device
 * - localStorage auth kaynağı değildir
 */

import { NextRequest, NextResponse } from "next/server";
import {
  authHash,
  buildBackendUrl,
  cacheDelete,
  cacheGet,
  cacheSet,
  fetchWithTimeout,
  newCorrelationId,
  parseJsonSafe,
  pickClientAuth,
  resolveAcceptLanguage,
  resolveTenantKey,
} from "@/app/api/_shared/bff";

const BFF_LOG =
  process.env.LM_BFF_LOG === "1" ||
  process.env.NEXT_PUBLIC_LM_BFF_LOG === "1";

const UPSTREAM_PATH = "/api/v1.0/account/me";
const CACHE_TTL_SECONDS = 10;

/**
 * BFF log helper
 */
function log(...args: any[]) {
  if (!BFF_LOG) return;
  console.log(...args);
}

function warn(...args: any[]) {
  if (!BFF_LOG) return;
  console.warn(...args);
}

/**
 * /me cache anahtarını auth + dil + tenant bazında üretir.
 *
 * Not:
 * Kullanıcıya özel veri taşıdığı için auth boyutu anahtarın parçasıdır.
 */
function buildCacheKey(args: {
  authHeader: string;
  lang?: string | null;
  tenant?: string | null;
}) {
  const lang = (args.lang ?? "none").trim();
  const tenant = (args.tenant ?? "none").trim();

  return `account:me:${authHash(args.authHeader)}:lang:${lang}:tenant:${tenant}`;
}

/**
 * Upstream çağrısını ortak standarda göre yapar.
 */
async function upstreamRequest(opts: {
  req: NextRequest;
  corrId: string;
  method: "GET" | "PATCH";
  picked: { header: string; source: string };
  body?: string | null;
}) {
  const { req, corrId, method, picked, body } = opts;

  const acceptLanguage = resolveAcceptLanguage(req);
  const { tenantKey } = resolveTenantKey(req);

  const headers: Record<string, string> = {
    accept: "application/json",
    "x-correlation-id": corrId,
    "accept-language": acceptLanguage,
    "x-tenant-key": tenantKey,
    authorization: picked.header,
  };

  if (method !== "GET") {
    headers["content-type"] = "application/json";
  }

  log("🟦 [BFF account/users/me] OUT", {
    corrId,
    method,
    authSource: picked.source,
    hasFinalAuth: true,
    acceptLanguage,
    tenantKey,
  });

  try {
    const upstream = await fetchWithTimeout(
      buildBackendUrl(UPSTREAM_PATH),
      {
        method,
        headers,
        body: method === "GET" ? undefined : body ?? "",
        cache: "no-store",
      },
      8_000
    );

    const payload = await parseJsonSafe(upstream);

    log("🟩 [BFF account/users/me] UPSTREAM", {
      corrId,
      status: upstream.status,
      ok: upstream.ok,
    });

    return {
      ok: upstream.ok,
      status: upstream.status,
      payload,
    };
  } catch (error: any) {
    warn("🟥 [BFF account/users/me] ERR", {
      corrId,
      message: error?.message ?? String(error),
    });

    return {
      ok: false,
      status: 502,
      payload: { ok: false, error: "FETCH_FAILED" },
    };
  }
}

/**
 * Backend response içinden kullanıcı payload'ını normalize eder.
 *
 * Olası şekiller:
 * - { data: { data: user } }
 * - { data: user }
 * - direkt user
 */
function unwrapUserPayload(payload: any) {
  return payload?.data?.data ?? payload?.data ?? payload ?? null;
}

/* -------------------------------------------------------------------------- */
/* GET                                                                        */
/* -------------------------------------------------------------------------- */

export async function GET(req: NextRequest) {
  const corrId = newCorrelationId(req.headers);
  const picked = pickClientAuth(req);

  if (!picked) {
    log("🟥 [BFF account/users/me] NO USER AUTH", {
      corrId,
      method: "GET",
    });

    return NextResponse.json(
      {
        ok: false,
        status: 401,
        data: null,
        error: "UNAUTHORIZED",
      },
      {
        status: 401,
        headers: { "x-correlation-id": corrId },
      }
    );
  }

  const acceptLanguage = resolveAcceptLanguage(req);
  const { tenantKey } = resolveTenantKey(req);

  const cacheKey = buildCacheKey({
    authHeader: picked.header,
    lang: acceptLanguage,
    tenant: tenantKey,
  });

  const cached = cacheGet<any>(cacheKey);
  if (cached) {
    log("🟨 [BFF account/users/me] CACHE HIT", {
      corrId,
      cacheKey,
    });

    return NextResponse.json(
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
        },
      }
    );
  }

  const upstream = await upstreamRequest({
    req,
    corrId,
    method: "GET",
    picked,
  });

  if (!upstream.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: upstream.status,
        data: null,
        error:
          upstream.status === 401
            ? "UNAUTHORIZED"
            : upstream.status === 403
              ? "FORBIDDEN"
              : "UPSTREAM_ERROR",
      },
      {
        status: upstream.status || 502,
        headers: { "x-correlation-id": corrId },
      }
    );
  }

  const user = unwrapUserPayload(upstream.payload);

  cacheSet(cacheKey, user, CACHE_TTL_SECONDS);

  log("🟦 [BFF account/users/me] CACHE SET", {
    corrId,
    cacheKey,
    ttl: CACHE_TTL_SECONDS,
  });

  return NextResponse.json(
    {
      ok: true,
      status: upstream.status,
      data: user,
      error: null,
    },
    {
      status: 200,
      headers: {
        "x-correlation-id": corrId,
        "x-audit-log": "success",
      },
    }
  );
}

/* -------------------------------------------------------------------------- */
/* PATCH                                                                      */
/* -------------------------------------------------------------------------- */

export async function PATCH(req: NextRequest) {
  const corrId = newCorrelationId(req.headers);
  const picked = pickClientAuth(req);

  if (!picked) {
    log("🟥 [BFF account/users/me] NO USER AUTH", {
      corrId,
      method: "PATCH",
    });

    return NextResponse.json(
      {
        ok: false,
        status: 401,
        data: null,
        error: "UNAUTHORIZED",
      },
      {
        status: 401,
        headers: { "x-correlation-id": corrId },
      }
    );
  }

  const bodyTxt = await req.text().catch(() => "");
  const acceptLanguage = resolveAcceptLanguage(req);
  const { tenantKey } = resolveTenantKey(req);

  const upstream = await upstreamRequest({
    req,
    corrId,
    method: "PATCH",
    picked,
    body: bodyTxt,
  });

  if (upstream.ok) {
    const cacheKey = buildCacheKey({
      authHeader: picked.header,
      lang: acceptLanguage,
      tenant: tenantKey,
    });

    cacheDelete(cacheKey);

    log("🧹 [BFF account/users/me] CACHE INVALIDATE", {
      corrId,
      cacheKey,
    });
  }

  return NextResponse.json(
    (upstream.payload as any) ?? { ok: false, error: "NO_PAYLOAD" },
    {
      status: upstream.ok ? 200 : upstream.status || 502,
      headers: { "x-correlation-id": corrId },
    }
  );
}