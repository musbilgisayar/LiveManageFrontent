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
import {
  ACCESS_TOKEN_COOKIE_NAMES,
  REFRESH_TOKEN_COOKIE_NAMES,
  appendExpiredAuthCookies,
  createHttpOnlyCookie,
  extractAuthTokenPayload,
  normalizeSetCookieForBrowser,
  readFirstCookieValue,
} from "@/lib/bff/authCookies";

const REFRESH_TIMEOUT_MS = parseInt(
  process.env.BFF_REFRESH_TIMEOUT_MS || "10000",
  10
);

const DEVICE_ID_COOKIE_NAME = "lm.did";

interface RefreshResponseData {
  accessToken?: string | null;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
  refreshTokenExpiresAt?: string | null;
}

interface RefreshApiResponse {
  ok?: boolean;
  success?: boolean;
  isSuccess?: boolean;
  message?: string;
  userMessage?: string;
  data?: RefreshResponseData | Record<string, unknown> | null;
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
  const data =
    value.data && typeof value.data === "object"
      ? (value.data as Record<string, unknown>)
      : null;

  return (
    typeof value.ok === "boolean" ||
    typeof value.success === "boolean" ||
    typeof value.isSuccess === "boolean" ||
    typeof data?.ok === "boolean" ||
    typeof data?.success === "boolean" ||
    typeof data?.isSuccess === "boolean"
  );
}

function isRefreshBodySuccessful(body: RefreshApiResponse | null): boolean {
  if (!body) return false;
  if (body.ok === true) return true;
  if (body.success === true) return true;
  if (body.isSuccess === true) return true;

  const data =
    body.data && typeof body.data === "object"
      ? (body.data as Record<string, unknown>)
      : null;

  return (
    data?.ok === true ||
    data?.success === true ||
    data?.isSuccess === true
  );
}

function appendNormalizedSetCookies(
  headers: Headers,
  cookies: string[]
): number {
  let count = 0;

  for (const cookie of cookies) {
    if (!cookie) continue;
    headers.append("set-cookie", normalizeSetCookieForBrowser(cookie));
    count += 1;
  }

  return count;
}

function hasAuthCookie(cookies: string[], names: readonly string[]): boolean {
  const expected = new Set(names.map((name) => name.toLowerCase()));

  return cookies.some((cookie) => {
    const name = cookie.split("=")[0]?.trim().toLowerCase();
    return !!name && expected.has(name);
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const correlationId = resolveCorrelationId(req);
  const logger = createLogger("BFF-REFRESH", correlationId);
  const tenantResolution = resolveTenantDetailed(req);
  const upstreamUrl = resolveBackendUrl("/api/v1.0/account/refresh");

  const currentAccessToken = readFirstCookieValue(req, ACCESS_TOKEN_COOKIE_NAMES);

  const currentRefreshToken = readFirstCookieValue(req, REFRESH_TOKEN_COOKIE_NAMES);

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

    const responseText = await upstream.text();
    const upstreamSetCookies = extractSetCookies(upstream.headers);
    const responseHeaders = filterProxyResponseHeaders(upstream, []);

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

    const tokenPayload = extractAuthTokenPayload(parsedBody);
    const newAccessToken = tokenPayload.accessToken ?? null;
    const newRefreshToken = tokenPayload.refreshToken ?? null;
    const accessTokenExpiresAt = tokenPayload.accessTokenExpiresAt ?? null;
    const refreshTokenExpiresAt = tokenPayload.refreshTokenExpiresAt ?? null;
    const forwardedCookieCount = appendNormalizedSetCookies(
      responseHeaders,
      upstreamSetCookies
    );
    const upstreamHasAccessTokenCookie = hasAuthCookie(
      upstreamSetCookies,
      ACCESS_TOKEN_COOKIE_NAMES
    );
    const upstreamHasRefreshTokenCookie = hasAuthCookie(
      upstreamSetCookies,
      REFRESH_TOKEN_COOKIE_NAMES
    );

    if (!upstreamHasAccessTokenCookie && newAccessToken) {
      responseHeaders.append(
        "set-cookie",
        createHttpOnlyCookie(
          ACCESS_TOKEN_COOKIE_NAMES[0],
          newAccessToken,
          null
        )
      );
    }

    if (!upstreamHasRefreshTokenCookie && newRefreshToken) {
      responseHeaders.append(
        "set-cookie",
        createHttpOnlyCookie(
          REFRESH_TOKEN_COOKIE_NAMES[0],
          newRefreshToken,
          refreshTokenExpiresAt
        )
      );
    }

    const hasAccessTokenCookie =
      !!newAccessToken ||
      upstreamHasAccessTokenCookie;

    const hasRefreshTokenCookie =
      !!newRefreshToken ||
      upstreamHasRefreshTokenCookie;

    const isSuccess =
      upstream.ok &&
      isRefreshBodySuccessful(body) &&
      hasAccessTokenCookie &&
      hasRefreshTokenCookie;

    if (!isSuccess) {
      const expiredCookieCount = appendExpiredAuthCookies(responseHeaders);

      logger.warn("Refresh failed", {
        upstreamStatus: upstream.status,
        bodyOk: isRefreshBodySuccessful(body),
        hasAccessToken: !!newAccessToken,
        hasRefreshToken: !!newRefreshToken,
        hasAccessTokenCookie,
        hasRefreshTokenCookie,
        hasDeviceId: !!currentDeviceId,
        forwardedCookieCount,
        expiredCookieCount,
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
      generatedSetCookieCount:
        Number(!upstreamHasAccessTokenCookie && !!newAccessToken) +
        Number(!upstreamHasRefreshTokenCookie && !!newRefreshToken),
      upstreamSetCookieCount: upstreamSetCookies.length,
      forwardedCookieCount,
    });

    const successBody: SuccessResponse = {
      ok: true,
      message: body?.message,
      userMessage: body?.userMessage ?? body?.message,
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
