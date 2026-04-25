// ============================================================
// File: src/app/api/_shared/globalFetcher.server.ts
// ============================================================

/// 🌐 BFF Proxy Fetcher (SERVER ONLY)

import "server-only";
import crypto from "crypto";
import { resolveTenantDetailed } from "@/lib/bff/resolveTenant";

const envFlag = (key: string): string => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key] ?? "";
  }
  return "";
};

const SERVER_LOG_ON = (): boolean => envFlag("LM_BFF_LOG") === "1";

const nowMs = (): number =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

const short = (value?: string | null, max = 120): string => {
  const text = (value ?? "").toString();
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
};

const maskAuth = (auth?: string | null): string => {
  if (!auth) return "(yok)";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token.length <= 14) return `Bearer ${token}`;
  return `Bearer ${token.slice(0, 6)}…${token.slice(-6)}`;
};

const maskTenant = (tenantKey?: string | null): string => {
  if (!tenantKey || tenantKey.trim() === "") return "(yok)";
  return tenantKey.trim();
};

const isAnonymousAuthPath = (url: string): boolean => {
  const value = url.toLowerCase();

  return (
    value.includes("/api/v1.0/account/login") ||
    value.includes("/api/v1.0/account/refresh") ||
    value.includes("/api/v1.0/account/register") ||
    value.includes("/api/v1.0/account/forgot-password") ||
    value.includes("/api/v1.0/account/reset-password") ||
    value.includes("/api/v1.0/account/confirm-email")
  );
};

const createRequestId = (): string => {
  if (
    typeof globalThis !== "undefined" &&
    (globalThis as any).crypto?.randomUUID
  ) {
    return (globalThis as any).crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
};

const createCorrelationId = (
  incoming?: string | null,
  fallback?: string
): string => {
  if (incoming && incoming.trim() !== "") return incoming;

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return fallback ?? createRequestId();
};

const tryParseJson = (text: string) => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { ok: false, raw: text };
  }
};

function normalizeSetCookieForBff(cookie: string): string {
  let normalized = cookie;

  // BFF host'una yazılabilmesi için upstream Domain bilgisini kaldır.
  normalized = normalized.replace(/;\s*Domain=[^;]+/i, "");

  // Dev ortamında frontend http ise Secure cookie yazılamayabilir.
  if (process.env.NODE_ENV === "development") {
    normalized = normalized.replace(/;\s*Secure/gi, "");
  }

  return normalized;
}

const appendSetCookies = (source: Headers, target: Headers): string[] => {
  const getSetCookieFn = (source as any).getSetCookie;

  if (typeof getSetCookieFn === "function") {
    const cookies: string[] = getSetCookieFn.call(source) ?? [];
    if (cookies.length > 0) {
      const normalizedCookies = cookies.map(normalizeSetCookieForBff);
      normalizedCookies.forEach((cookie) => target.append("set-cookie", cookie));
      return normalizedCookies;
    }
  }

  const single = source.get("set-cookie");
  if (single) {
    const normalized = normalizeSetCookieForBff(single);
    target.append("set-cookie", normalized);
    return [normalized];
  }

  return [];
};

export default async function globalFetcher(
  req: Request,
  url: string
): Promise<Response> {
  const reqId = createRequestId();
  const startedAt = nowMs();

  const method = (req.method || "GET").toUpperCase();
  const hasBody = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const body = hasBody ? await req.text() : undefined;

  const incomingCorrelationId = req.headers.get("x-correlation-id");
  const correlationId = createCorrelationId(incomingCorrelationId, reqId);

  const contentType = req.headers.get("content-type");
  const acceptLanguage = req.headers.get("accept-language");
  const authorization = req.headers.get("authorization");
  const cookie = req.headers.get("cookie");

  const tenantResolution = resolveTenantDetailed(req);
  const tenantKey = tenantResolution.tenantKey;

  const headers: Record<string, string> = {
    "x-correlation-id": correlationId,
  };

  if (contentType && contentType.trim() !== "") {
    headers["Content-Type"] = contentType;
  }

  if (acceptLanguage && acceptLanguage.trim() !== "") {
    headers["Accept-Language"] = acceptLanguage;
  }

  headers["X-Tenant-Key"] = tenantKey;

  const shouldForwardAuthorization =
    !!authorization &&
    authorization.trim() !== "" &&
    !isAnonymousAuthPath(url);

  if (shouldForwardAuthorization) {
    headers["Authorization"] = authorization;
  }

  if (cookie && cookie.trim() !== "") {
    headers["Cookie"] = cookie;
  }

  if (SERVER_LOG_ON()) {
    console.info("🔵 [BFF][REQ] Upstream isteği gönderiliyor", {
      reqId,
      correlationId,
      method,
      url,
      tenantKey: maskTenant(tenantKey),
      tenantSource: tenantResolution.source,
      incomingHeaderTenant: maskTenant(tenantResolution.fromHeader),
      cookieTenant: maskTenant(tenantResolution.fromCookie),
      acceptLanguage: acceptLanguage ?? "(yok)",
      authorization: maskAuth(authorization),
      hasCookie: Boolean(cookie),
      cookieLength: cookie?.length ?? 0,
      contentType: contentType ?? "(yok)",
      bodyBytes: body?.length ?? 0,
    });
  }

  try {
    const upstreamResponse = await fetch(url, {
      method,
      headers,
      ...(hasBody ? { body } : {}),
    });

    const elapsedMs = Math.round(nowMs() - startedAt);
    const responseText = await upstreamResponse.text();
    const parsedBody = tryParseJson(responseText);

    if (SERVER_LOG_ON()) {
      console.info("🟣 [BFF][RES] Upstream yanıtı alındı", {
        reqId,
        correlationId,
        method,
        url,
        status: upstreamResponse.status,
        ok: upstreamResponse.ok,
        elapsedMs,
        tenantKey: maskTenant(tenantKey),
        tenantSource: tenantResolution.source,
        contentType: upstreamResponse.headers.get("content-type") ?? "(yok)",
        envelopeOk: (parsedBody as any)?.ok,
        responseKeys: Object.keys((parsedBody as any) ?? {}),
      });
    }

    if (!upstreamResponse.ok && SERVER_LOG_ON()) {
      console.error("🔴 [BFF][ERR] Upstream hata yanıtı döndü", {
        reqId,
        correlationId,
        method,
        url,
        status: upstreamResponse.status,
        tenantKey: maskTenant(tenantKey),
        tenantSource: tenantResolution.source,
        payload: parsedBody,
        raw:
          typeof (parsedBody as any)?.raw === "string"
            ? short((parsedBody as any).raw, 500)
            : undefined,
      });
    }

    const responseHeaders = new Headers({
      "Content-Type": "application/json",
      "x-correlation-id": correlationId,
    });

    const forwardedCookies = appendSetCookies(
      upstreamResponse.headers,
      responseHeaders
    );

    if (SERVER_LOG_ON()) {
      console.info("🍪 [BFF][COOKIE] Set-Cookie forward sonucu", {
        reqId,
        correlationId,
        method,
        url,
        forwardedCookieCount: forwardedCookies.length,
        forwardedCookieNames: forwardedCookies.map((c) => c.split("=")[0]),
      });
    }

    return new Response(JSON.stringify(parsedBody), {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    const elapsedMs = Math.round(nowMs() - startedAt);

    console.error("💥 [BFF][EX] Upstream network veya SSL hatası", {
      reqId,
      correlationId,
      method,
      url,
      elapsedMs,
      tenantKey: maskTenant(tenantKey),
      tenantSource: tenantResolution.source,
      message: error?.message ?? String(error),
    });

    return new Response(
      JSON.stringify({
        ok: false,
        error: error?.message ?? "fetch failed",
        reqId,
        correlationId,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": correlationId,
        },
      }
    );
  }
}
