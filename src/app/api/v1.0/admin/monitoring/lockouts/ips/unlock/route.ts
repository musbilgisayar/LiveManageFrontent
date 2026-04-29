// src/app/api/v1.0/admin/monitoring/lockouts/ips/unlock/route.ts

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/app/api/_shared/bff";

export async function POST(req: NextRequest) {
  const body = await req.text();

  return proxyJsonWithWebAuth({
    req,
    backendPath: "/api/v1.0/admin/monitoring/lockouts/ips/unlock",
    method: "POST",
    body,
    logLabel: "BFF LOCKOUT UNLOCK IP",
  });
}