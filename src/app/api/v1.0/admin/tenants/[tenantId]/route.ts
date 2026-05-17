export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { cacheGet, cacheSet } from "@/app/api/_shared/bff";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

type RouteContext = {
  params: Promise<{
    tenantId: string;
  }>;
};

function detailCacheKey(tenantId: string) {
  return `tenants:detail:${tenantId}`;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { tenantId } = await context.params;
  const correlationId = resolveCorrelationId(req);
  const cacheKey = detailCacheKey(tenantId);

  const cached = cacheGet<any>(cacheKey);
  if (cached) {
    return Response.json(cached, {
      status: 200,
      headers: {
        "x-correlation-id": correlationId,
        "x-audit-log": "cache-hit",
      },
    });
  }

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/admin/tenants/${tenantId}`,
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "AdminTenantDetailGet",
    transformResponse: (payload, proxyContext) => {
      if (
        proxyContext.upstreamStatus >= 200 &&
        proxyContext.upstreamStatus < 300
      ) {
        cacheSet(cacheKey, payload, 20);
      }

      const headers = new Headers();
      headers.set("x-correlation-id", proxyContext.correlationId);

      return {
        body:
          payload && typeof payload === "object"
            ? payload
            : { ok: false, error: "NO_PAYLOAD" },
        status: proxyContext.upstreamStatus,
        headers,
      };
    },
  });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { tenantId } = await context.params;
  const bodyText = await req.text().catch(() => "");

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/admin/tenants/${tenantId}`,
    method: "PUT",
    body: bodyText,
    timeoutMs: 15_000,
    logLabel: "AdminTenantUpdate",
    extraHeaders: {
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    transformResponse: (payload, proxyContext) => {
      if (
        proxyContext.upstreamStatus >= 200 &&
        proxyContext.upstreamStatus < 300
      ) {
        cacheSet(detailCacheKey(tenantId), null as any, 0);
      }

      const headers = new Headers();
      headers.set("x-correlation-id", proxyContext.correlationId);

      return {
        body:
          payload && typeof payload === "object"
            ? payload
            : { ok: false, error: "NO_PAYLOAD" },
        status: proxyContext.upstreamStatus,
        headers,
      };
    },
  });
}