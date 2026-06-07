// src/app/api/v1.0/account/users/me/route.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { cacheGet, cacheSet } from "@/app/api/_shared/bff";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { buildUserScopedCacheKey } from "@/lib/bff/userScopedCache";

export const runtime = "nodejs";

const CACHE_TTL_SECONDS = 3;

type CachedAccountMeResult = {
  status: number;
  payload: unknown;
  setCookies: string[];
};

const inFlightRequests = new Map<string, Promise<CachedAccountMeResult>>();

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

async function readJsonIfPossible(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  const text = await response.clone().text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function createJsonResponseWithCookies(
  payload: unknown,
  status: number,
  setCookies: string[],
  auditValue: string,
): NextResponse {
  const response = NextResponse.json(payload ?? { ok: false, data: null }, {
    status,
    headers: {
      "cache-control": `private, max-age=${CACHE_TTL_SECONDS}`,
      "x-audit-log": auditValue,
    },
  });

  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

export async function GET(req: NextRequest) {
  const cacheKey = buildUserScopedCacheKey({
    namespace: "account:users:me",
    req,
    includeCookieHeader: true,
  });

  const cached = cacheGet<unknown>(cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "cache-control": `private, max-age=${CACHE_TTL_SECONDS}`,
        "x-audit-log": "cache-hit",
      },
    });
  }

  let request = inFlightRequests.get(cacheKey);

  if (!request) {
    request = (async (): Promise<CachedAccountMeResult> => {
      const response = await proxyJsonWithWebAuth(req, {
        method: "GET",
        url: "/api/v1.0/account/me",
        logLabel: "ACCOUNT_ME_GET",

        /**
         * Türkçe not:
         * Proactive refresh sadece merkezi session endpointinde açık.
         */
        enableProactiveRefresh: true,
      });

      const payload = await readJsonIfPossible(response);
      const setCookies = readSetCookieHeaders(response);

      if (response.ok && payload) {
        cacheSet(cacheKey, payload, CACHE_TTL_SECONDS);
      }

      return {
        status: response.status,
        payload,
        setCookies,
      };
    })().finally(() => {
      inFlightRequests.delete(cacheKey);
    });

    inFlightRequests.set(cacheKey, request);
  }

  const result = await request;

  return createJsonResponseWithCookies(
    result.payload,
    result.status,
    result.setCookies,
    "deduped",
  );
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);

  return proxyJsonWithWebAuth(req, {
    method: "PATCH",
    url: "/api/v1.0/account/me",
    body,
    logLabel: "ACCOUNT_ME_PATCH",

    /**
     * Türkçe not:
     * Yazma işleminde proactive refresh yok.
     * Access geçersizse 401 sonrası refresh + retry yeterli.
     */
    disableProactiveRefresh: true,
  });
}