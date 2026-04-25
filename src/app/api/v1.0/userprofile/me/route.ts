// src/app/api/v1.0/[lang]/userprofile/me/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  newCorrelationId,
  getServiceToken,
  cacheGet,
  cacheSet,
} from "@/app/api/_shared/bff";
import crypto from "node:crypto";

const BACKEND = process.env.BACKEND_BASE ?? "https://localhost:5002";
const BE_INSECURE = process.env.BE_SSL_INSECURE === "true";

let _undiciReady: Promise<void> | null = null;

function ensureUndici(): Promise<void> {
  if (!BE_INSECURE) return Promise.resolve();
  if (_undiciReady) return _undiciReady;

  _undiciReady = (async () => {
    try {
      const { Agent, setGlobalDispatcher } = await import("undici");
      setGlobalDispatcher(new Agent({ connect: { rejectUnauthorized: false } }));
    } catch {}
  })();

  return _undiciReady;
}

// "tr-TR" -> "tr"
const toPrefix = (s?: string) => (s ?? "tr").split("-")[0].toLowerCase();

/**
 * Lang çözümleme:
 * 1) route param (compat)
 * 2) lm.lang cookie
 * 3) Accept-Language
 * 4) default "tr"
 */
function resolveLangSeg(req: NextRequest, routeLang?: string) {
  if (routeLang) return toPrefix(routeLang);

  const c = req.cookies.get("lm.lang")?.value;
  if (c) return toPrefix(c);

  const al = req.headers.get("accept-language");
  if (al) return toPrefix(al.split(",")[0]?.trim());

  return "tr";
}

function etagFor(obj: unknown) {
  try {
    const txt = JSON.stringify(obj);
    const h = crypto
      .createHash("sha1")
      .update(txt)
      .digest("base64url")
      .slice(0, 16);
    return `"lm-${h}"`;
  } catch {
    return `"lm-${crypto.randomUUID()}"`;
  }
}

type Ctx = { params?: { lang?: string } };

function authHash(authHeader: string) {
  const key = (authHeader ?? "").trim();
  if (!key) return "noauth";
  return crypto.createHash("sha1").update(key).digest("hex").slice(0, 12);
}

function buildCacheKey(langSeg: string, authHeader: string) {
  return `userprofile:me:${langSeg}:${authHash(authHeader)}`;
}

/**
 * ✅ Öncelik sırası:
 * 1) Client Authorization header
 * 2) accessToken cookie (web)
 * 3) alternatifi cookie adları
 */
function pickClientAuth(
  req: NextRequest
): { header: string; source: string } | null {
  const h =
    req.headers.get("authorization") ||
    req.headers.get("Authorization") ||
    "";

  if (h.trim().toLowerCase().startsWith("bearer ")) {
    return { header: h.trim(), source: "client-header" };
  }

  const c1 = req.cookies.get("accessToken")?.value;
  if (c1?.trim()) {
    return { header: `Bearer ${c1.trim()}`, source: "cookie-accessToken" };
  }

  const c2 = req.cookies.get("accessToken")?.value;
  if (c2?.trim()) {
    return { header: `Bearer ${c2.trim()}`, source: "cookie-accessToken" };
  }

  const c3 = req.cookies.get("access_token")?.value;
  if (c3?.trim()) {
    return { header: `Bearer ${c3.trim()}`, source: "cookie-access_token" };
  }

  const c4 = req.cookies.get("lm_at")?.value;
  if (c4?.trim()) {
    return { header: `Bearer ${c4.trim()}`, source: "cookie-lm_at" };
  }

  return null;
}

async function upstreamRequest(opts: {
  req: NextRequest;
  corrId: string;
  upstreamUrl: string;
  method: "GET" | "PATCH";
  etagIn?: string;
  body?: string | null;
}) {
  const { req, corrId, upstreamUrl, method, etagIn, body } = opts;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);

  try {
    const svcToken = await getServiceToken();
    const picked = pickClientAuth(req);

    const headers: Record<string, string> = {
      accept: "application/json",
      "x-correlation-id": corrId,
      ...(etagIn ? { "if-none-match": etagIn } : {}),
    };

    // ✅ Auth öncelik: client header/cookie -> service token
    if (picked) headers["authorization"] = picked.header;
    else if (svcToken) headers["authorization"] = `Bearer ${svcToken}`;

    // ✅ Dil forward
    const acceptLang = req.headers.get("accept-language");
    if (acceptLang) headers["accept-language"] = acceptLang;

    if (method !== "GET") headers["content-type"] = "application/json";

    console.info("🟦 [BFF userprofile/me] OUT", {
      corrId,
      method,
      url: upstreamUrl,
      authSource: picked?.source ?? (svcToken ? "service-token" : "none"),
      hasFinalAuth: !!headers["authorization"],
      acceptLanguage: headers["accept-language"] ?? "(yok)",
      ifNoneMatch: etagIn ?? "(yok)",
    });

    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body: method === "GET" ? undefined : body ?? "",
      cache: "no-store",
      signal: ac.signal,
    });

    const upstreamEtag = upstream.headers.get("etag") ?? undefined;
    const upstreamCC =
      upstream.headers.get("cache-control") ?? "private, max-age=10";

    if (upstream.status === 304) {
      return {
        ok: true,
        status: 304 as const,
        etag: upstreamEtag ?? etagIn ?? `"lm-${crypto.randomUUID()}"`,
        cacheControl: upstreamCC,
        payload: null,
      };
    }

    const txt = await upstream.text().catch(() => "");
    let payload: any;

    try {
      payload = txt ? JSON.parse(txt) : {};
    } catch {
      payload = { ok: false, raw: txt };
    }

    console.info("🟩 [BFF userprofile/me] UPSTREAM", {
      corrId,
      method,
      status: upstream.status,
      ok: upstream.ok,
      authSource: picked?.source ?? (svcToken ? "service-token" : "none"),
    });

    return {
      ok: upstream.ok,
      status: upstream.status,
      etag: upstreamEtag,
      cacheControl: upstreamCC,
      payload,
    };
  } catch (e: any) {
    console.warn("🟥 [BFF userprofile/me] ERR", {
      corrId,
      method,
      message: e?.message ?? e,
    });

    return {
      ok: false,
      status: 0,
      etag: undefined,
      cacheControl: "no-store",
      payload: {
        ok: false,
        error: e?.name === "AbortError" ? "UPSTREAM_TIMEOUT" : "FETCH_FAILED",
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest, ctx: Ctx) {
  await ensureUndici();

  const routeLang = ctx?.params?.lang;
  const langSeg = resolveLangSeg(req, routeLang);

  const corrId = newCorrelationId(req.headers);
  const upstreamUrl = `${BACKEND}/api/v1.0/UserProfile/me`;

  const picked = pickClientAuth(req);
  const authKey = picked?.header ?? "";
  const etagIn = req.headers.get("if-none-match") || undefined;

  console.info("🟦 [BFF userprofile/me] IN", {
    corrId,
    routeLang: routeLang ?? "-",
    langSeg,
    authSource: picked?.source ?? "none",
    hasAuth: !!picked,
    hasaccessTokenCookie: !!req.cookies.get("accessToken")?.value,
    hasRefreshTokenCookie: !!req.cookies.get("RefreshToken")?.value,
    lmLang: req.cookies.get("lm.lang")?.value ?? "-",
  });

  const cacheKey = buildCacheKey(langSeg, authKey);
  const cached = cacheGet<any>(cacheKey);

  if (cached) {
    const etag = etagFor(cached);

    console.info("🟨 [BFF userprofile/me] CACHE HIT", {
      corrId,
      cacheKey,
    });

    if (etagIn && etagIn === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "not-modified",
          ETag: etag,
          "Cache-Control": "private, max-age=10",
          Vary: "Accept-Language, Authorization",
        },
      });
    }

    return NextResponse.json(
      { ok: true, status: 200, data: cached, error: null },
      {
        status: 200,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "cache-hit",
          ETag: etag,
          "Cache-Control": "private, max-age=10",
          Vary: "Accept-Language, Authorization",
        },
      }
    );
  }

  const upstream = await upstreamRequest({
    req,
    corrId,
    upstreamUrl,
    method: "GET",
    etagIn,
  });

  if (upstream.status === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        "x-correlation-id": corrId,
        "x-audit-log": "not-modified",
        ETag: upstream.etag ?? etagIn ?? `"lm-${crypto.randomUUID()}"`,
        "Cache-Control": upstream.cacheControl ?? "private, max-age=10",
        Vary: "Accept-Language, Authorization",
      },
    });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: upstream.status,
        data: null,
        error: "UPSTREAM_NOT_OK",
        payload: upstream.payload,
      },
      {
        status: 200,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "failed",
          Vary: "Accept-Language, Authorization",
        },
      }
    );
  }

  const profile =
    upstream.payload?.data?.data ??
    upstream.payload?.data ??
    upstream.payload;

  const etag = upstream.etag ?? etagFor(profile);
  const cacheControl = upstream.cacheControl ?? "private, max-age=10";

  cacheSet(cacheKey, profile, 10);

  console.info("🟩 [BFF userprofile/me] CACHE SET", {
    corrId,
    cacheKey,
    ttl: 10,
  });

  return NextResponse.json(
    { ok: true, status: upstream.status, data: profile, error: null },
    {
      status: 200,
      headers: {
        "x-correlation-id": corrId,
        "x-audit-log": "success",
        ETag: etag,
        "Cache-Control": cacheControl,
        Vary: "Accept-Language, Authorization",
      },
    }
  );
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  await ensureUndici();

  const routeLang = ctx?.params?.lang;
  const langSeg = resolveLangSeg(req, routeLang);

  const corrId = newCorrelationId(req.headers);
  const upstreamUrl = `${BACKEND}/api/v1.0/UserProfile/me`;

  const picked = pickClientAuth(req);
  const authKey = picked?.header ?? "";
  const bodyTxt = await req.text().catch(() => "");

  console.info("🟦 [BFF userprofile/me PATCH] IN", {
    corrId,
    lang: langSeg,
    authSource: picked?.source ?? "none",
    hasAuth: !!picked,
    bodyLen: bodyTxt.length,
  });

  const upstream = await upstreamRequest({
    req,
    corrId,
    upstreamUrl,
    method: "PATCH",
    body: bodyTxt,
  });

  console.info("🟩 [BFF userprofile/me PATCH] UPSTREAM", {
    corrId,
    status: upstream.status,
    ok: upstream.ok,
  });

  if (upstream.ok) {
    const cacheKey = buildCacheKey(langSeg, authKey);
    cacheSet(cacheKey, null as any, 0);

    console.info("🧹 [BFF userprofile/me PATCH] CACHE INVALIDATE", {
      corrId,
      cacheKey,
    });
  }

  return NextResponse.json(upstream.payload, {
    status: 200,
    headers: {
      "x-correlation-id": corrId,
      Vary: "Accept-Language, Authorization",
    },
  });
}