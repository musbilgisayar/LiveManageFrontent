export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { cacheSet } from "@/app/api/_shared/bff";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

type RouteContext = {
  params: Promise<{
    tenantId: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { tenantId } = await context.params;
  const bodyText = await req.text().catch(() => "");

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/admin/tenants/${tenantId}/status`,
    method: "PATCH",
    body: bodyText,
    timeoutMs: 15_000,
    logLabel: "AdminTenantStatusUpdate",
    extraHeaders: {
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    transformResponse: (payload, proxyContext) => {
      if (
        proxyContext.upstreamStatus >= 200 &&
        proxyContext.upstreamStatus < 300
      ) {
        cacheSet(`tenants:detail:${tenantId}`, null as any, 0);
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