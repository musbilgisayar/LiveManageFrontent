export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/app/api/_shared/bff";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveBackendUrl } from "@/lib/bff/webAuthProxyCore";

const CACHE_TTL_SECONDS = 300;
type CachedLanguagesResult = {
  status: number;
  payload: unknown;
};

const inFlightRequests = new Map<string, Promise<CachedLanguagesResult>>();

async function readJsonIfPossible(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  const text = await response.clone().text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildCacheKey(req: NextRequest): string {
  const language = req.headers.get("accept-language")?.split(",")[0]?.trim() || "default";
  const tenant = req.headers.get("x-tenant-key")?.trim() || "default";
  return `localization:languages:v1:${tenant}:${language.toLowerCase()}`;
}

export async function GET(req: NextRequest) {
  const cacheKey = buildCacheKey(req);
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
    request = (async (): Promise<CachedLanguagesResult> => {
      const response = await proxyJsonWithWebAuth(req, {
        url: resolveBackendUrl("/api/v1.0/culture/list"),
        method: "GET",
        timeoutMs: 15_000,
        logLabel: "LocalizationLanguages.GET",
      });

      const payload = await readJsonIfPossible(response);

      if (response.ok && payload) {
        cacheSet(cacheKey, payload, CACHE_TTL_SECONDS);
      }

      return {
        status: response.status,
        payload,
      };
    })().finally(() => {
      inFlightRequests.delete(cacheKey);
    });

    inFlightRequests.set(cacheKey, request);
  }

  const result = await request;

  return NextResponse.json(result.payload ?? { ok: false, data: [] }, {
    status: result.status,
    headers: {
      "cache-control": `private, max-age=${CACHE_TTL_SECONDS}`,
      "x-audit-log": "deduped",
    },
  });
}
