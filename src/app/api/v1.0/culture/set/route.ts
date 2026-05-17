//src\app\api\v1.0\culture\set\route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { newCorrelationId, getServiceToken } from "@/app/api/_shared/bff";

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

function normalizeLang(seg?: string) {
  const s = (seg ?? "tr").trim();
  return /^[a-z]{2}$/i.test(s) ? s.toLowerCase() : s;
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

function resolveTenantKey(req: NextRequest) {
  return (
    req.headers.get("x-tenant-key")?.trim() ||
    req.cookies.get("lm.tenant")?.value?.trim() ||
    req.cookies.get("tenantKey")?.value?.trim() ||
    "livemanage"
  );
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ lang: string }> }
) {
  await ensureUndici();

  const { lang } = await ctx.params;
  const langSeg = normalizeLang(lang);
  const corrId = newCorrelationId(req.headers);
  const picked = pickClientAuth(req);
  const tenantKey = resolveTenantKey(req);

  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const upstreamUrl = `${BACKEND}/api/v1/${langSeg}/Culture/set`;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);

  try {
    const svcToken = await getServiceToken();

    const upstreamHeaders: Record<string, string> = {
      accept: "application/json",
      "content-type": "application/json",
      "x-correlation-id": corrId,
      "x-tenant-key": tenantKey,
    };

    if (picked) {
      upstreamHeaders["authorization"] = picked.header;
    } else if (svcToken) {
      upstreamHeaders["authorization"] = `Bearer ${svcToken}`;
    }

    console.info("🟦 [BFF culture/set] OUT", {
      corrId,
      langSeg,
      upstreamUrl,
      authSource: picked?.source ?? (svcToken ? "service-token" : "none"),
      hasAuth: !!upstreamHeaders["authorization"],
      tenantKey,
      body,
    });

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
      signal: ac.signal,
    });

    const text = await upstream.text().catch(() => "");
    let payload: any;

    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }

    console.info("🟩 [BFF culture/set] UPSTREAM", {
      corrId,
      status: upstream.status,
      ok: upstream.ok,
      authSource: picked?.source ?? (svcToken ? "service-token" : "none"),
    });

    const cookieVal =
      (body?.culture as string | undefined)?.split("-")[0]?.toLowerCase() ??
      langSeg;

    if (!upstream.ok) {
      const res = NextResponse.json(
        {
          ok: false,
          status: upstream.status,
          error: "UPSTREAM_NOT_OK",
          passthroughCookie: cookieVal,
        },
        { status: 200 }
      );

      // ✅ Tutarlı cookie adı
      res.cookies.set("lm.lang", cookieVal, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });

      return res;
    }

    const res = NextResponse.json({ ok: true, data: payload }, { status: 200 });

    // ✅ Tutarlı cookie adı
    res.cookies.set("lm.lang", cookieVal, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return res;
  } catch (e: any) {
    console.warn("🟥 [BFF culture/set] ERR", {
      corrId,
      message: e?.message ?? e,
    });

    const res = NextResponse.json(
      { ok: false, status: 0, error: "FETCH_FAILED" },
      { status: 200 }
    );

    // ✅ Tutarlı cookie adı
    res.cookies.set("lm.lang", langSeg, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return res;
  } finally {
    clearTimeout(t);
  }
}