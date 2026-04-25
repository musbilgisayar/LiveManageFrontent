export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  newCorrelationId,
  cacheGet,
  cacheSet,
} from "@/app/api/_shared/bff";
import {
  DEFAULT_JSON_TIMEOUT_MS,
  buildWebAuthHeaders,
  isAbortLikeError,
  resolveBackendUrl,
  resolveCorrelationId,
  withTimeout,
} from "@/lib/bff/webAuthProxyCore";

const BACKEND =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

const BFF_LOG =
  process.env.LM_BFF_LOG === "1" ||
  process.env.NEXT_PUBLIC_LM_BFF_LOG === "1";

const UPSTREAM_PATH = "/api/v1.0/Account/me";

function log(...args: any[]) {
  if (!BFF_LOG) return;
  console.log(...args);
}

function warn(...args: any[]) {
  if (!BFF_LOG) return;
  console.warn(...args);
}

function pickClientAuth(req: NextRequest): { source: string } | null {
  const h =
    req.headers.get("authorization") ||
    req.headers.get("Authorization") ||
    "";

  if (h.trim().toLowerCase().startsWith("bearer ")) {
    return { source: "client-header" };
  }

  const c1 = req.cookies.get("accessToken")?.value;
  if (c1?.trim()) return { source: "cookie-accessToken" };

  const c2 = req.cookies.get("access_token")?.value;
  if (c2?.trim()) return { source: "cookie-access_token" };

  const c3 = req.cookies.get("lm_at")?.value;
  if (c3?.trim()) return { source: "cookie-lm_at" };

  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader?.trim()) return { source: "cookie-header" };

  return null;
}

function authHashFromRequest(req: NextRequest) {
  const authHeader =
    req.headers.get("authorization") ||
    req.headers.get("Authorization") ||
    req.cookies.get("accessToken")?.value ||
    req.cookies.get("access_token")?.value ||
    req.cookies.get("lm_at")?.value ||
    req.headers.get("cookie") ||
    "";

  const key = String(authHeader ?? "").trim();
  if (!key) return "noauth";

  return crypto.createHash("sha1").update(key).digest("hex").slice(0, 12);
}

function buildCacheKeyFromReq(req: NextRequest) {
  const lang = (req.headers.get("accept-language") ?? "none").trim();
  return `account:me:${authHashFromRequest(req)}:lang:${lang}`;
}

async function readJsonSafe(res: Response) {
  const raw = await res.text().catch(() => "");
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return { ok: false, raw };
  }
}

async function upstreamRequest(opts: {
  req: NextRequest;
  corrId: string;
  method: "GET" | "PATCH";
  body?: string | null;
}) {
  const { req, corrId, method, body } = opts;

  const picked = pickClientAuth(req);

  if (!picked) {
    warn("🌍 [BFF][account/users/me] no user auth", {
      corrId,
      method,
    });

    return {
      ok: false,
      status: 401,
      payload: { ok: false, error: "UNAUTHORIZED" },
    };
  }

  const headers = buildWebAuthHeaders(req, corrId, {
    defaultAccept: "application/json",
  });

  if (method !== "GET") {
    headers.set("content-type", "application/json");
  }

  log("🟦 [BFF account/users/me] OUT", {
    corrId,
    method,
    authSource: picked.source,
    hasCookie: !!req.headers.get("cookie"),
    hasAuthorization: !!req.headers.get("authorization"),
    acceptLanguage: headers.get("accept-language") ?? "(yok)",
  });

  const { signal, cleanup } = withTimeout(DEFAULT_JSON_TIMEOUT_MS);

  try {
    const upstream = await fetch(
      resolveBackendUrl(`${BACKEND}${UPSTREAM_PATH}`),
      {
        method,
        headers,
        body: method === "GET" ? undefined : body ?? "",
        cache: "no-store",
        signal,
      }
    );

    const payload = await readJsonSafe(upstream);

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
  } catch (e: unknown) {
    warn("🟥 [BFF account/users/me] ERR", {
      corrId,
      method,
      message: e instanceof Error ? e.message : "Unknown error",
    });

    return {
      ok: false,
      status: isAbortLikeError(e) ? 504 : 502,
      payload: {
        ok: false,
        error: isAbortLikeError(e) ? "TIMEOUT" : "FETCH_FAILED",
      },
    };
  } finally {
    cleanup();
  }
}

export async function GET(req: NextRequest) {
  const corrId =
    req.headers.get("x-correlation-id") ||
    newCorrelationId(req.headers) ||
    resolveCorrelationId(req);

  const cacheKey = buildCacheKeyFromReq(req);

  const cached = cacheGet<any>(cacheKey);
  if (cached) {
    log("🟨 [BFF account/users/me] CACHE HIT", { corrId, cacheKey });

    return NextResponse.json(
      { ok: true, status: 200, data: cached, error: null },
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
  });

  if (!upstream.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: upstream.status,
        data: null,
        error: upstream.payload?.error ?? "UPSTREAM_ERROR",
      },
      {
        status:
          upstream.status && upstream.status !== 0
            ? upstream.status
            : 502,
        headers: { "x-correlation-id": corrId },
      }
    );
  }

  const user =
    upstream.payload?.data?.data ??
    upstream.payload?.data ??
    upstream.payload;

  cacheSet(cacheKey, user, 10);

  log("🟦 [BFF account/users/me] CACHE SET", {
    corrId,
    cacheKey,
    ttl: 10,
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

export async function PATCH(req: NextRequest) {
  const corrId =
    req.headers.get("x-correlation-id") ||
    newCorrelationId(req.headers) ||
    resolveCorrelationId(req);

  const bodyTxt = await req.text().catch(() => "");

  const upstream = await upstreamRequest({
    req,
    corrId,
    method: "PATCH",
    body: bodyTxt,
  });

  if (upstream.ok) {
    const cacheKey = buildCacheKeyFromReq(req);
    cacheSet(cacheKey, null as any, 0);

    log("🧹 [BFF account/users/me] CACHE INVALIDATE", {
      corrId,
      cacheKey,
    });
  }

  return NextResponse.json(
    upstream.payload ?? { ok: false, error: "NO_PAYLOAD" },
    {
      status: upstream.ok
        ? 200
        : upstream.status && upstream.status !== 0
          ? upstream.status
          : 502,
      headers: { "x-correlation-id": corrId },
    }
  );
}