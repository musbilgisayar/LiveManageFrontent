export const runtime = "nodejs";
export const preferredRegion = "auto";
export const maxDuration = 10;

import { NextRequest, NextResponse } from "next/server";
import { resolveTenantDetailed } from "@/lib/bff/resolveTenant";
import {
  buildWebAuthHeaders,
  extractSetCookies,
  filterProxyResponseHeaders,
  isAbortLikeError,
  resolveBackendUrl,
  resolveCorrelationId,
  withTimeout,
} from "@/lib/bff/webAuthProxyCore";
import { createLogger } from "@/lib/bff/logger";

const REFRESH_TIMEOUT_MS = parseInt(
  process.env.BFF_REFRESH_TIMEOUT_MS || "10000",
  10
);

const ACCESS_TOKEN_COOKIE_NAME =
  process.env.BFF_ACCESS_TOKEN_COOKIE_NAME || "accessToken";

const REFRESH_TOKEN_COOKIE_NAME =
  process.env.BFF_REFRESH_TOKEN_COOKIE_NAME || "RefreshToken";

const DEVICE_ID_COOKIE_NAME = "lm.did";

interface RefreshResponseData {
  accessToken?: string | null;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
  refreshTokenExpiresAt?: string | null;
}

interface RefreshApiResponse {
  ok: boolean;
  message?: string;
  userMessage?: string;
  data?: RefreshResponseData | null;
}

interface ErrorResponse {
  ok: false;
  error: string;
  correlationId: string;
  message?: string;
  userMessage?: string;
}

interface SuccessResponse {
  ok: true;
  message?: string;
  userMessage?: string;
  data: {
    accessTokenExpiresAt?: string | null;
    refreshTokenExpiresAt?: string | null;
  };
  correlationId: string;
}

function createHttpOnlyCookie(
  name: string,
  value: string,
  expiresAt?: string | null,
  options?: {
    path?: string;
    sameSite?: "Lax" | "Strict" | "None";
    secure?: boolean;
  }
): string {
  const parts = [
    `${name}=${value}`,
    `Path=${options?.path ?? "/"}`,
    "HttpOnly",
    options?.secure !== false ? "Secure" : "",
    `SameSite=${options?.sameSite ?? "Lax"}`,
  ].filter(Boolean);

  if (expiresAt) {
    const expires = new Date(expiresAt);

    if (!Number.isNaN(expires.getTime())) {
      parts.push(`Expires=${expires.toUTCString()}`);
    }
  }

  return parts.join("; ");
}

function safeJsonParse<T>(text: string): T | null {
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function validateRefreshResponse(body: unknown): body is RefreshApiResponse {
  if (!body || typeof body !== "object") return false;

  const value = body as Record<string, unknown>;
  return typeof value.ok === "boolean";
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const correlationId = resolveCorrelationId(req);
  const logger = createLogger("BFF-REFRESH", correlationId);
  const tenantResolution = resolveTenantDetailed(req);
  const upstreamUrl = resolveBackendUrl("/api/v1.0/account/refresh");

  const currentAccessToken =
    req.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;

  const currentRefreshToken =
    req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;

  const currentDeviceId = req.cookies.get(DEVICE_ID_COOKIE_NAME)?.value ?? null;

  logger.debug("Refresh request received", {
    upstreamUrl,
    tenantKey: tenantResolution.tenantKey,
    tenantSource: tenantResolution.source,
    hasAccessToken: !!currentAccessToken,
    hasRefreshToken: !!currentRefreshToken,
    hasDeviceId: !!currentDeviceId,
    accessTokenLength: currentAccessToken?.length ?? 0,
    refreshTokenLength: currentRefreshToken?.length ?? 0,
  });

  if (!currentRefreshToken) {
    logger.warn("RefreshToken cookie missing");

    return NextResponse.json<ErrorResponse>(
      {
        ok: false,
        error: "BFF_REFRESH_TOKEN_MISSING",
        correlationId,
      },
      { status: 401 }
    );
  }

  const headers = buildWebAuthHeaders(req, correlationId, {
    defaultAccept: "application/json",
    includeAuthorization: false,
  });

  headers.set("content-type", "application/json");

  const { signal, cleanup } = withTimeout(REFRESH_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
        clientType: "web",
        deviceId: currentDeviceId,
      }),
      cache: "no-store",
      signal,
    });

    const responseHeaders = filterProxyResponseHeaders(upstream, []);
    const responseText = await upstream.text();
    const upstreamSetCookies = extractSetCookies(upstream.headers);

    for (const cookie of upstreamSetCookies) {
      responseHeaders.append("set-cookie", cookie);
    }

    const parsedBody = safeJsonParse<RefreshApiResponse>(responseText);
    const body = validateRefreshResponse(parsedBody) ? parsedBody : null;

    logger.debug("Refresh body debug", {
      upstreamStatus: upstream.status,
      upstreamOk: upstream.ok,
      contentType: upstream.headers.get("content-type"),
      hasResponseText: !!responseText,
      responseTextLength: responseText.length,
      responseTextPreview:
        process.env.NODE_ENV === "production"
          ? undefined
          : responseText.slice(0, 1000),
      parsedBodyType: typeof parsedBody,
      parsedBodyKeys:
        parsedBody && typeof parsedBody === "object"
          ? Object.keys(parsedBody)
          : [],
      parsedDataKeys:
        parsedBody?.data && typeof parsedBody.data === "object"
          ? Object.keys(parsedBody.data)
          : [],
      parsedOk: parsedBody?.ok,
      validated: !!body,
      upstreamSetCookieCount: upstreamSetCookies.length,
    });

    const newAccessToken = body?.data?.accessToken ?? null;
    const newRefreshToken = body?.data?.refreshToken ?? null;
    const accessTokenExpiresAt = body?.data?.accessTokenExpiresAt ?? null;
    const refreshTokenExpiresAt = body?.data?.refreshTokenExpiresAt ?? null;
    const shouldGenerateCookiesFromBody = upstreamSetCookies.length === 0;

    if (shouldGenerateCookiesFromBody && newAccessToken) {
      responseHeaders.append(
        "set-cookie",
        createHttpOnlyCookie(
          ACCESS_TOKEN_COOKIE_NAME,
          newAccessToken,
          accessTokenExpiresAt
        )
      );
    }

    if (shouldGenerateCookiesFromBody && newRefreshToken) {
      responseHeaders.append(
        "set-cookie",
        createHttpOnlyCookie(
          REFRESH_TOKEN_COOKIE_NAME,
          newRefreshToken,
          refreshTokenExpiresAt
        )
      );
    }

    const isSuccess =
      upstream.ok &&
      body?.ok === true &&
      !!newAccessToken &&
      !!newRefreshToken;

    if (!isSuccess) {
      logger.warn("Refresh failed", {
        upstreamStatus: upstream.status,
        bodyOk: body?.ok,
        hasAccessToken: !!newAccessToken,
        hasRefreshToken: !!newRefreshToken,
        hasDeviceId: !!currentDeviceId,
      });

      return NextResponse.json<ErrorResponse>(
        {
          ok: false,
          error: "BFF_REFRESH_FAILED",
          message: body?.message ?? "Refresh failed.",
          userMessage:
            body?.userMessage ?? body?.message ?? "Oturum yenilenemedi.",
          correlationId,
        },
        {
          status: upstream.status === 200 ? 401 : upstream.status,
          headers: responseHeaders,
        }
      );
    }

    logger.info("Refresh successful", {
      hasAccessToken: !!newAccessToken,
      hasRefreshToken: !!newRefreshToken,
      generatedSetCookieCount: shouldGenerateCookiesFromBody
        ? Number(!!newAccessToken) + Number(!!newRefreshToken)
        : 0,
      upstreamSetCookieCount: upstreamSetCookies.length,
    });

    const successBody: SuccessResponse = {
      ok: true,
      message: body.message,
      userMessage: body.userMessage ?? body.message,
      data: {
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      },
      correlationId,
    };

    responseHeaders.set("content-type", "application/json; charset=utf-8");

    return new NextResponse(JSON.stringify(successBody), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const isTimeout = isAbortLikeError(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Refresh error", {
      error: errorMessage,
      isTimeout,
      upstreamUrl,
    });

    return NextResponse.json<ErrorResponse>(
      {
        ok: false,
        error: isTimeout ? "BFF_REFRESH_TIMEOUT" : "BFF_REFRESH_ERROR",
        correlationId,
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    cleanup();
  }
}