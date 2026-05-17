export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { cacheGet, cacheSet } from "@/app/api/_shared/bff";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

const BFF_LOG =
  process.env.LM_BFF_LOG === "1" ||
  process.env.NEXT_PUBLIC_LM_BFF_LOG === "1";

function log(...args: any[]) {
  if (!BFF_LOG) return;
  console.log(...args);
}

function buildCacheKey(req: NextRequest): string {
  const includeInactive =
    req.nextUrl.searchParams.get("includeInactive") ?? "false";

  const lang = (req.headers.get("accept-language") ?? "none").trim();

  return `tenants:options:includeInactive:${includeInactive}:lang:${lang}`;
}

export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);
  const cacheKey = buildCacheKey(req);

  const cached = cacheGet<any>(cacheKey);
  if (cached) {
    log("🟨 [BFF tenants/options] CACHE HIT", {
      correlationId,
      cacheKey,
    });

    return Response.json(cached, {
      status: 200,
      headers: {
        "x-correlation-id": correlationId,
        "x-audit-log": "cache-hit",
      },
    });
  }

  const includeInactive =
    req.nextUrl.searchParams.get("includeInactive") ?? "false";

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/admin/tenants/options?includeInactive=${encodeURIComponent(
      includeInactive
    )}`,
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "AdminTenantOptionsGet",
    transformResponse: (payload, context) => {
      if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
        cacheSet(cacheKey, payload, 30);

        log("🟦 [BFF tenants/options] CACHE SET", {
          correlationId: context.correlationId,
          cacheKey,
          ttl: 30,
        });
      }

      const headers = new Headers();
      headers.set("x-correlation-id", context.correlationId);
      headers.set(
        "x-audit-log",
        context.upstreamStatus >= 200 && context.upstreamStatus < 300
          ? "success"
          : "upstream-error"
      );

      return {
        body:
          payload && typeof payload === "object"
            ? payload
            : { ok: false, error: "NO_PAYLOAD" },
        status: context.upstreamStatus,
        headers,
      };
    },
  });
}