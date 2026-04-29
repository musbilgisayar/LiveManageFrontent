import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(req: NextRequest) {
  const queryString = req.nextUrl.searchParams.toString();

  const url = queryString
    ? `/api/v1.0/admin/monitoring/audit-timeline?${queryString}`
    : "/api/v1.0/admin/monitoring/audit-timeline";

  return proxyJsonWithWebAuth(req, {
    url,
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "AuditTimelineList",
  });
}