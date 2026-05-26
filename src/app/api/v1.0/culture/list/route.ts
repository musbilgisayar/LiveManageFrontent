export const runtime = "nodejs";

/**
 * Culture List BFF Route
 * -----------------------------------------------------------------------------
 * Amaç:
 * - Frontend tarafı için kültür/dil listesini standart BFF kapısından sunmak
 * - Web auth cookie-first omurgasına uyumlu kalmak
 * - Tenant / correlation-id / language / refresh / retry davranışlarını
 *   merkezi proxy helper'a bırakmak
 *
 * Neden bu kadar ince?
 * - Bu route artık auth, retry, timeout, cookie merge gibi altyapı davranışlarını
 *   kendisi yazmaz.
 * - Tüm bu sorumluluklar proxyJsonWithWebAuth + webAuthProxyCore içinde çözülür.
 * - Böylece route sade, bakım dostu ve tutarlı kalır.
 *
 * Upstream:
 * - GET /api/v1.0/culture/list
 */

import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/app/api/_shared/bff";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const LOG_LABEL = "CultureList.GET";
const BACKEND_ROUTE = "/api/v1.0/culture/list";
const CACHE_TTL_SECONDS = 300;
type CachedCultureListResult = {
  status: number;
  payload: unknown;
};

const inFlightRequests = new Map<string, Promise<CachedCultureListResult>>();

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
  return `culture:list:v1:${tenant}:${language.toLowerCase()}`;
}

export async function GET(req: NextRequest) {
  try {
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
      request = (async (): Promise<CachedCultureListResult> => {
        const response = await proxyJsonWithWebAuth(req, {
          url: BACKEND_ROUTE,
          method: "GET",
          logLabel: LOG_LABEL,
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
  } catch (error) {
    console.error(`[BFF][${LOG_LABEL}][EX]`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        message: "BFF culture list request failed.",
        userMessage: "Dil listesi alınamadı.",
        data: [],
      },
      { status: 500 }
    );
  }
}
