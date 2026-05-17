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

function buildListCacheKey(req: NextRequest): string {
  const includeInactive =
    req.nextUrl.searchParams.get("includeInactive") ?? "true";

  const lang = (req.headers.get("accept-language") ?? "none").trim();

  return `tenants:list:includeInactive:${includeInactive}:lang:${lang}`;
}

function invalidateTenantCaches() {
  cacheSet("tenants:list:includeInactive:true:lang:none", null as any, 0);
  cacheSet("tenants:list:includeInactive:false:lang:none", null as any, 0);
}

export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);
  const cacheKey = buildListCacheKey(req);

  const cached = cacheGet<any>(cacheKey);
  if (cached) {
    log("🟨 [BFF tenants/list] CACHE HIT", {
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
    req.nextUrl.searchParams.get("includeInactive") ?? "true";

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/admin/tenants?includeInactive=${encodeURIComponent(
      includeInactive
    )}`,
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "AdminTenantsGet",
    transformResponse: (payload, context) => {
      if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
        cacheSet(cacheKey, payload, 20);

        log("🟦 [BFF tenants/list] CACHE SET", {
          correlationId: context.correlationId,
          cacheKey,
          ttl: 20,
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

export async function POST(req: NextRequest) {
  const bodyText = await req.text().catch(() => "");

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/admin/tenants`,
    method: "POST",
    body: bodyText,
    timeoutMs: 15_000,
    logLabel: "AdminTenantCreate",
    extraHeaders: {
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    transformResponse: (payload, context) => {
      if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
        invalidateTenantCaches();

        log("🧹 [BFF tenants/create] CACHE INVALIDATE", {
          correlationId: context.correlationId,
        });
      }

      const headers = new Headers();
      headers.set("x-correlation-id", context.correlationId);

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