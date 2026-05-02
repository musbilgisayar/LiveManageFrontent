// ============================================================
// File: src/app/api/_shared/globalFetcher.server.ts
// ============================================================

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
    typeof globalThis.crypto?.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
};

const createCorrelationId = (
  incoming?: string | null,
  fallback?: string
): string => {
  if (incoming && incoming.trim() !== "") return incoming;

  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return fallback ?? createRequestId();
};

function normalizeSetCookieForBff(cookie: string): string {
  let normalized = cookie;

  normalized = normalized.replace(/;\s*Domain=[^;]+/i, "");

  if (process.env.NODE_ENV === "development") {
    normalized = normalized.replace(/;\s*Secure/gi, "");
  }

  return normalized;
}

function splitCombinedSetCookie(headerValue: string): string[] {
  const result: string[] = [];
  let current = "";
  let inExpires = false;

  for (let i = 0; i < headerValue.length; i += 1) {
    const char = headerValue[i];
    const remaining = headerValue.slice(i);

    if (!inExpires && remaining.toLowerCase().startsWith("expires=")) {
      inExpires = true;
    }

    if (inExpires && char === ";") {
      inExpires = false;
    }

    if (!inExpires && char === ",") {
      const rest = headerValue.slice(i + 1);
      const cookieStartMatch = rest.match(
        /^\s*([!#$%&'*+\-.^_`|~0-9A-Za-z]+)=/
      );

      if (cookieStartMatch) {
        if (current.trim()) {
          result.push(current.trim());
        }
        current = "";
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

function getSetCookieValues(headers: Headers): string[] {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof withGetSetCookie.getSetCookie === "function") {
    try {
      const cookies = withGetSetCookie.getSetCookie();
      if (Array.isArray(cookies) && cookies.length > 0) {
        return cookies.filter(Boolean);
      }
    } catch {
      // Fallback below.
    }
  }

  const raw = headers.get("set-cookie");
  if (!raw) {
    return [];
  }

  return splitCombinedSetCookie(raw).filter(Boolean);
}

function appendSetCookies(source: Headers, target: Headers): string[] {
  const cookies = getSetCookieValues(source).map(normalizeSetCookieForBff);

  for (const cookie of cookies) {
    target.append("set-cookie", cookie);
  }

  return cookies;
}

function copyResponseHeaders(source: Headers, correlationId: string): Headers {
  const target = new Headers();

  source.forEach((value, key) => {
    const lower = key.toLowerCase();

    if (
      lower === "set-cookie" ||
      lower === "content-length" ||
      lower === "transfer-encoding" ||
      lower === "connection"
    ) {
      return;
    }

    target.set(key, value);
  });

  target.set("x-correlation-id", correlationId);
  appendSetCookies(source, target);

  return target;
}

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
    "x-tenant-key": tenantKey,
  };

  if (contentType && contentType.trim() !== "") {
    headers["Content-Type"] = contentType;
  }

  if (acceptLanguage && acceptLanguage.trim() !== "") {
    headers["Accept-Language"] = acceptLanguage;
  }

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
      cache: "no-store",
    });

    const elapsedMs = Math.round(nowMs() - startedAt);
    const rawSetCookies = getSetCookieValues(upstreamResponse.headers);
    const responseHeaders = copyResponseHeaders(
      upstreamResponse.headers,
      correlationId
    );
    const responseText = await upstreamResponse.text();
    const responseContentType =
      upstreamResponse.headers.get("content-type") ?? "(yok)";

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
        contentType: responseContentType,
        responseBytes: responseText.length,
        setCookieCount: rawSetCookies.length,
        setCookieNames: rawSetCookies.map((c) => c.split("=")[0]),
        rawSetCookieHeader: upstreamResponse.headers.get("set-cookie") ?? "(yok)",
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
        raw:
          typeof responseText === "string" ? short(responseText, 500) : undefined,
      });
    }

    if (SERVER_LOG_ON()) {
      const forwardedCookies = getSetCookieValues(responseHeaders);

      console.info("🍪 [BFF][COOKIE] Set-Cookie forward sonucu", {
        reqId,
        correlationId,
        method,
        url,
        forwardedCookieCount: forwardedCookies.length,
        forwardedCookieNames: forwardedCookies.map((c) => c.split("=")[0]),
      });
    }

    return new Response(responseText, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const elapsedMs = Math.round(nowMs() - startedAt);
    const message = error instanceof Error ? error.message : String(error);

    console.error("💥 [BFF][EX] Upstream network veya SSL hatası", {
      reqId,
      correlationId,
      method,
      url,
      elapsedMs,
      tenantKey: maskTenant(tenantKey),
      tenantSource: tenantResolution.source,
      message,
    });

    return new Response(
      JSON.stringify({
        ok: false,
        error: message,
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
