// src/app/api/v1.0/menus/top/route.ts
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

const toPrefix = (s?: string) => (s ?? "tr").split("-")[0].toLowerCase();

function resolveLangSeg(req: NextRequest) {
  const cookieLang =
    req.cookies.get("lm.lang")?.value ||
    req.cookies.get("NEXT_LOCALE")?.value ||
    undefined;

  const headerLang = req.headers.get("accept-language") || undefined;

  const pick = (v?: string) => {
    if (!v) return undefined;
    return v.split(",")[0]?.trim();
  };

  return toPrefix(pick(cookieLang) ?? pick(headerLang) ?? "tr");
}

function resolveAcceptLanguage(req: NextRequest) {
  return (
    req.cookies.get("lm.lang")?.value ||
    req.cookies.get("NEXT_LOCALE")?.value ||
    req.headers.get("accept-language") ||
    "tr-TR"
  );
}

function resolveTenantKey(req: NextRequest) {
  return (
    req.headers.get("x-tenant-key")?.trim() ||
    req.cookies.get("lm.tenant")?.value?.trim() ||
    req.cookies.get("tenantKey")?.value?.trim() ||
    "default"
  );
}

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

function etagFor(obj: unknown) {
  try {
    const txt = JSON.stringify(obj);
    const h = crypto.createHash("sha1").update(txt).digest("base64url").slice(0, 16);
    return `"lm-${h}"`;
  } catch {
    return `"lm-${crypto.randomUUID()}"`;
  }
}

function authHash(authHeader: string) {
  const key = (authHeader ?? "").trim();
  if (!key) return "noauth";
  return crypto.createHash("sha1").update(key).digest("hex").slice(0, 12);
}

export async function GET(req: NextRequest) {
  await ensureUndici();

  const corrId = newCorrelationId(req.headers);
  const langSeg = resolveLangSeg(req);
  const tenantKey = resolveTenantKey(req);
  const picked = pickClientAuth(req);

  const upstreamUrl = `${BACKEND}/api/v1.0/menus/top`;
  const etagIn = req.headers.get("if-none-match") || undefined;

  const authKey = picked?.header ?? "";
  const cacheKey = `menu:top:${tenantKey}:${langSeg}:auth:${authHash(authKey)}`;
 
  

  const cached = cacheGet<any[]>(cacheKey);
  if (cached) {
    const etag = etagFor(cached);
 

    if (etagIn && etagIn === etag) {
      console.groupEnd();
      return new NextResponse(null, {
        status: 304,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "not-modified",
          ETag: etag,
          "Cache-Control": "public, max-age=30",
          Vary: "Accept-Language, Authorization, X-Tenant-Key",
        },
      });
    }

    console.groupEnd();
    return NextResponse.json(
      { ok: true, status: 200, data: cached, error: null },
      {
        status: 200,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "cache-hit",
          ETag: etag,
          "Cache-Control": "public, max-age=30",
          Vary: "Accept-Language, Authorization, X-Tenant-Key",
        },
      }
    );
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);

  try {
    const svcToken = await getServiceToken();
    const acceptLangHeader = resolveAcceptLanguage(req);

    const upstreamHeaders: Record<string, string> = {
      accept: "application/json",
      "x-correlation-id": corrId,
      "accept-language": acceptLangHeader,
      "x-tenant-key": tenantKey,
      ...(etagIn ? { "if-none-match": etagIn } : {}),
    };

    if (picked) {
      upstreamHeaders["authorization"] = picked.header;
    } else if (svcToken) {
      upstreamHeaders["authorization"] = `Bearer ${svcToken}`;
    }

 

    const upstream = await fetch(upstreamUrl, {
      headers: upstreamHeaders,
      cache: "no-store",
      signal: ac.signal,
    });

    if (upstream.status === 304) {
      const etag = upstream.headers.get("etag") ?? etagIn ?? `"lm-${crypto.randomUUID()}"`;
      const cc = upstream.headers.get("cache-control") ?? "public, max-age=300";

      console.groupEnd();
      return new NextResponse(null, {
        status: 304,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "not-modified",
          ETag: etag,
          "Cache-Control": cc,
          Vary: "Accept-Language, Authorization, X-Tenant-Key",
        },
      });
    }

    const txt = await upstream.text().catch(() => "");
    let payload: any;

    try {
      payload = JSON.parse(txt);
    } catch {
      payload = txt;
    }

 
    if (!upstream.ok) {
      console.groupEnd();
      return NextResponse.json(
        { ok: false, status: upstream.status, data: [], error: "UPSTREAM_NOT_OK" },
        {
          status: 200,
          headers: {
            "x-correlation-id": corrId,
            "x-audit-log": "failed",
            Vary: "Accept-Language, Authorization, X-Tenant-Key",
          },
        }
      );
    }

    const arr = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

    const etag = upstream.headers.get("etag") ?? etagFor(arr);
    const cacheControl = upstream.headers.get("cache-control") ?? "public, max-age=300";

    cacheSet(cacheKey, arr, 30);

  

    console.groupEnd();
    return NextResponse.json(
      { ok: true, status: upstream.status, data: arr, error: null },
      {
        status: 200,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "success",
          ETag: etag,
          "Cache-Control": cacheControl,
          Vary: "Accept-Language, Authorization, X-Tenant-Key",
        },
      }
    );
  } catch (e: any) {
    console.warn("🟥 [BFF MENUS/TOP] ERR", {
      corrId,
      message: e?.message ?? e,
    });

    console.groupEnd();
    return NextResponse.json(
      {
        ok: false,
        status: 0,
        data: [],
        error: e?.name === "AbortError" ? "UPSTREAM_TIMEOUT" : "FETCH_FAILED",
      },
      {
        status: 200,
        headers: {
          "x-correlation-id": corrId,
          "x-audit-log": "exception",
          Vary: "Accept-Language, Authorization, X-Tenant-Key",
        },
      }
    );
  } finally {
    clearTimeout(timer);
  }
}