//src/app/api/v1.0/account/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE_NAMES,
  DEVICE_ID_COOKIE_NAMES,
  REFRESH_TOKEN_COOKIE_NAMES,
  appendAuthCookiesFromPayload,
  appendExpiredAuthCookies,
  appendExpiredLegacyAuthCookies,
  normalizeSetCookieForBrowser,
  readFirstCookieValue,
} from "@/lib/bff/authCookies";
import {
  DEFAULT_JSON_TIMEOUT_MS,
  resolveBackendUrl,
  resolveCorrelationId,
  withTimeout,
} from "@/lib/bff/webAuthProxyCore";
import { resolveTenant } from "@/lib/bff/resolveTenant";

function readSetCookieHeaders(response: Response): string[] {
  const getSetCookie = (
    response.headers as Headers & {
      getSetCookie?: () => string[];
    }
  ).getSetCookie;

  if (typeof getSetCookie === "function") {
    return getSetCookie.call(response.headers);
  }

  const single = response.headers.get("set-cookie");

  if (!single) return [];

  return single
    .split(/,(?=\s*[^;,]+=)/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function readBodySafely(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => "");

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isExplicitRefreshFailure(body: unknown): boolean {
  return (
    !!body &&
    typeof body === "object" &&
    (body as Record<string, unknown>).ok === false
  );
}

function isExplicitRefreshSuccess(body: unknown): boolean {
  return (
    !!body &&
    typeof body === "object" &&
    (body as Record<string, unknown>).ok === true
  );
}

function isHardRefreshStatus(status: number): boolean {
  return status === 401 || status === 403;
}

function resolveFailureReason(
  body: unknown,
  upstreamStatus: number,
): string {
  if (isHardRefreshStatus(upstreamStatus)) {
    return upstreamStatus === 403 ? "FORBIDDEN" : "UNAUTHORIZED";
  }

  if (upstreamStatus >= 500) {
    return "REFRESH_UPSTREAM_ERROR";
  }

  if (isExplicitRefreshFailure(body)) {
    return "REFRESH_SOFT_FAILED";
  }

  return "REFRESH_FAILED";
}

function createRefreshFailureResponse(
  body: unknown,
  upstreamStatus: number,
  correlationId: string,
): NextResponse {
  const hardFailure = isHardRefreshStatus(upstreamStatus);
  const reason = resolveFailureReason(body, upstreamStatus);

  const existingPayload =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};

  const messageKey = "auth.sessionExpired";
  const redirectTo = "/login";

  const response = NextResponse.json(
    {
      ...existingPayload,
      ok: false,
      code: "SESSION_EXPIRED",
      error: "SESSION_EXPIRED",
      message: messageKey,
      userMessage:
        typeof existingPayload.userMessage === "string" &&
        existingPayload.userMessage.trim().length > 0
          ? existingPayload.userMessage
          : "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      userMessageKey: messageKey,
      reason,
      redirectTo,
      correlationId,
      data: {
        ...(existingPayload.data &&
        typeof existingPayload.data === "object"
          ? (existingPayload.data as Record<string, unknown>)
          : {}),
        code: "SESSION_EXPIRED",
        reason,
        redirectTo,
        messageKey,
        fallbackUserMessage: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
      },
    },
    {
      status: hardFailure ? 401 : 401,
    },
  );

  const expiredCookieCount = appendExpiredAuthCookies(response.headers);

  if (process.env.NODE_ENV !== "production") {
    console.warn("[BFF][BFF-REFRESH] Refresh session expired", {
      upstreamStatus,
      hardFailure,
      reason,
      expiredCookieCount,
      correlationId,
    });
  }

  return response;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const correlationId = resolveCorrelationId(req);
  const tenantKey = resolveTenant(req);
  const upstreamUrl = resolveBackendUrl("/api/v1.0/account/refresh");

  const accessToken = readFirstCookieValue(req, ACCESS_TOKEN_COOKIE_NAMES);
  const refreshToken = readFirstCookieValue(req, REFRESH_TOKEN_COOKIE_NAMES);
  const deviceId = readFirstCookieValue(req, DEVICE_ID_COOKIE_NAMES);

  const { signal, cleanup } = withTimeout(DEFAULT_JSON_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-correlation-id": correlationId,
        "x-tenant-key": tenantKey,
        "accept-language": req.headers.get("accept-language") ?? "tr-TR",
        cookie: req.headers.get("cookie") ?? "",
      },
      cache: "no-store",
      signal,
      body: JSON.stringify({
        accessToken,
        refreshToken,
        deviceId,
        clientType: "web",
      }),
    });

    const body = await readBodySafely(upstream);

    const upstreamCookies = readSetCookieHeaders(upstream)
      .map(normalizeSetCookieForBrowser)
      .filter(Boolean);

    const responseHeaders = new Headers();

    for (const cookie of upstreamCookies) {
      responseHeaders.append("set-cookie", cookie);
    }

    let payloadCookieCount = 0;

    if (upstreamCookies.length === 0) {
      payloadCookieCount = appendAuthCookiesFromPayload(body, responseHeaders);
    } else {
      appendExpiredLegacyAuthCookies(responseHeaders);
    }

    const bodyFailure = isExplicitRefreshFailure(body);
    const bodySuccess = isExplicitRefreshSuccess(body);

    const effectiveOk =
      upstream.ok &&
      !bodyFailure &&
      (upstreamCookies.length > 0 || payloadCookieCount > 0 || bodySuccess);

    if (process.env.NODE_ENV !== "production") {
      console.info("[BFF][BFF-REFRESH] Refresh body debug", {
        upstreamStatus: upstream.status,
        upstreamOk: upstream.ok,
        bodyFailure,
        bodySuccess,
        effectiveOk,
        upstreamSetCookieCount: upstreamCookies.length,
        payloadCookieCount,
        correlationId,
      });
    }

    if (!effectiveOk) {
      return createRefreshFailureResponse(body, upstream.status, correlationId);
    }

    return NextResponse.json(
      body ?? {
        ok: true,
        message: "Token yenilendi.",
        userMessage: "Token yenilendi.",
        correlationId,
      },
      {
        status: 200,
        headers: responseHeaders,
      },
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[BFF][BFF-REFRESH] Refresh proxy error", {
        correlationId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Token yenileme isteği başarısız oldu.",
        userMessage: "Oturum kontrolü sırasında geçici bir sorun oluştu.",
        reason: "NETWORK_ERROR",
        correlationId,
      },
      {
        status: 503,
      },
    );
  } finally {
    cleanup();
  }
}