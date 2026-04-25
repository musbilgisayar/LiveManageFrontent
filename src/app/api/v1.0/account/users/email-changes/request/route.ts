// src/app/api/v1.0/account/users/email-changes/request/route.ts

import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!; // örn: https://localhost:5002

// Server log flag (prod'da kapatmak için)
// terminal: LM_BFF_LOG=1
const BFF_LOG_ON = () => process.env.LM_BFF_LOG === "1";

function rid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`) as string;
}

function short(s?: string | null, n = 350) {
  const x = (s ?? "").toString();
  if (x.length <= n) return x;
  return x.slice(0, n) + "…";
}

function maskAuth(auth?: string | null) {
  if (!auth) return "(yok)";
  const t = auth.replace(/^Bearer\s+/i, "");
  if (t.length <= 14) return `Bearer ${t}`;
  return `Bearer ${t.slice(0, 6)}…${t.slice(-6)}`;
}

function getCorrelationId(req: NextRequest) {
  return (
    req.headers.get("x-correlation-id") ||
    req.headers.get("x-request-id") ||
    rid()
  );
}

function getAcceptLanguage(req: NextRequest) {
  return req.headers.get("accept-language") || "tr-TR";
}

function getAuthorization(req: NextRequest) {
  // 1) Client Authorization header forward
  const auth = req.headers.get("authorization");
  if (auth && auth.trim() !== "") return auth;

  // 2) Cookie’den token okuma (opsiyonel)
  const access = req.cookies.get("access_token")?.value;
  if (access && access.trim() !== "") return `Bearer ${access}`;

  return null;
}

/** Response text -> JSON parse (log için) */
function tryParseJson(text: string) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const corrId = getCorrelationId(req);
  const acceptLanguage = getAcceptLanguage(req);
  const authorization = getAuthorization(req);

  const backendUrl = `${BACKEND_BASE_URL}/api/v1.0/identity/AppUser/email-change/request`;

  // JSON body
  const bodyText = await req.text(); // hem json hem empty güvenli

  // headers forward
  const headers: Record<string, string> = {
    "content-type": req.headers.get("content-type") || "application/json",
    "accept": req.headers.get("accept") || "application/json",
    "accept-language": acceptLanguage,
    "x-correlation-id": corrId,
  };

  if (authorization) headers["authorization"] = authorization;

  // Tenant forward (örnek)
  const tenant = req.headers.get("x-tenant") || req.cookies.get("tenant")?.value;
  if (tenant) headers["x-tenant"] = tenant;

  // ✅ Cookie forward (bazı endpoint’lerde gerekebilir; standardize etmek iyi)
  // Bu route özelinde şart olmayabilir ama debugging için çok faydalı.
  const cookie = req.headers.get("cookie");
  if (cookie && cookie.trim() !== "") headers["cookie"] = cookie;

  // İstek log (masked + özet)
  if (BFF_LOG_ON()) {
    console.log("🔵 [BFF][EmailChangeRequest][REQ] upstream'e gidiyor", {
      corrId,
      backendUrl,
      method: "POST",
      acceptLanguage,
      hasAuth: Boolean(authorization),
      auth: maskAuth(authorization),
      tenant: tenant ?? "(yok)",
      cookieVarMi: Boolean(cookie),
      cookieLen: cookie?.length ?? 0,
      bodyBytes: bodyText?.length ?? 0,
      bodyPreview: short(bodyText, 250),
    });
  }

  try {
    const upstream = await fetch(backendUrl, {
      method: "POST",
      headers,
      body: bodyText || undefined,
      cache: "no-store",
    });

    const respText = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "application/json";

    // Log response (status + json alanları)
    if (BFF_LOG_ON()) {
      const json = tryParseJson(respText);
      console.log("🟣 [BFF][EmailChangeRequest][RES] upstream cevap", {
        corrId,
        status: upstream.status,
        ok: upstream.ok,
        contentType,
        respBytes: respText?.length ?? 0,
        // JSON ise önemli alanları yakala
        envelopeOk: json ? (json.ok ?? json.success) : undefined,
        code: json ? (json.errorCode ?? json.code ?? json.type) : undefined,
        message: json ? (json.userMessage ?? json.message ?? json.error ?? json.title) : undefined,
        // JSON değilse ufak preview
        rawPreview: json ? undefined : short(respText, 250),
      });

      // extra ipucu: 401 ise token expired olabilir
      if (upstream.status === 401) {
        console.warn("🟠 [BFF][EmailChangeRequest] 401 döndü. Muhtemel sebepler: access token expired / auth header yok / invalid token.", {
          corrId,
          hasAuth: Boolean(authorization),
          auth: maskAuth(authorization),
        });
      }

      // tuzak tespiti: status 200 ama envelope ok false
      const json2 = json;
      if (upstream.status === 200 && json2 && (json2.ok === false || json2.success === false)) {
        console.warn("🟠 [BFF][EmailChangeRequest] Upstream 200 ama payload ok:false. Client refresh tetiklenmez; bu anti-pattern olabilir.", {
          corrId,
          code: json2.errorCode ?? json2.code ?? json2.type,
          message: json2.userMessage ?? json2.message ?? json2.error ?? json2.title,
        });
      }
    }

    // ✅ En önemli kısım: upstream status’u KORU
    return new NextResponse(respText, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
        "x-correlation-id": corrId,
        "cache-control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("💥 [BFF][EmailChangeRequest][EX]", {
      corrId,
      backendUrl,
      message: err?.message ?? String(err),
    });

    return NextResponse.json(
      {
        ok: false,
        error: "BFF proxy error",
        correlationId: corrId,
      },
      { status: 502, headers: { "x-correlation-id": corrId } }
    );
  }
}