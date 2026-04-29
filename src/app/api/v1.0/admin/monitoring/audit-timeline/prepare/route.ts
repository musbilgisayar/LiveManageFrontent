import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/admin/monitoring/audit-timeline/export/prepare",
    method: "POST",
    body,
    timeoutMs: 20_000,
    logLabel: "AuditTimelineExportPrepare",
  });
}