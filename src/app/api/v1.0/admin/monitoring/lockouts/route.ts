// File: src/app/api/v1.0/monitoring/lockouts/route.ts

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(req: NextRequest) {
  const queryString = req.nextUrl.searchParams.toString();
  const url = queryString
    ? `/api/v1.0/admin/monitoring/lockouts?${queryString}`
    : "/api/v1.0/admin/monitoring/lockouts";

  return proxyJsonWithWebAuth(req, {
    url,
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "MonitoringLockoutList",
  });
}