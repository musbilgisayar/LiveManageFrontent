// src/app/api/v1.0/admin/monitoring/lockouts/[id]/extend/route.ts

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/app/api/_shared/bff";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await req.text();

  return proxyJsonWithWebAuth({
    req,
    backendPath: `/api/v1.0/admin/monitoring/lockouts/${encodeURIComponent(id)}/extend`,
    method: "POST",
    body,
    logLabel: "BFF LOCKOUT EXTEND",
  });
}