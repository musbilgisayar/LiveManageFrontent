import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(req: NextRequest) {
  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/admin/monitoring/audit-timeline/recent",
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "AuditTimelineRecent",
  });
}