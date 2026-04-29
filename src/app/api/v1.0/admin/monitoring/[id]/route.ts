import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/admin/monitoring/audit-timeline/${encodeURIComponent(id)}`,
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "AuditTimelineDetail",
  });
}