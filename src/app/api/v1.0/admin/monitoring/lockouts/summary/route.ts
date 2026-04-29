export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/app/api/_shared/bff";

export async function GET(req: NextRequest) {
  return proxyJsonWithWebAuth({
    req,
    backendPath: "/api/v1.0/admin/monitoring/lockouts/summary",
    method: "GET",
    logLabel: "BFF LOCKOUT SUMMARY",
  });
}