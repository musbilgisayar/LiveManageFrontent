//src/app/api/v1.0/admin/monitoring/lockouts/users/[userId]/unlock/route.ts
import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/app/api/_shared/bff";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const { userId } = await context.params;

  const body = await req.text();

  return proxyJsonWithWebAuth({
    req,
    backendPath: `/api/v1.0/admin/monitoring/lockouts/users/${encodeURIComponent(userId)}/unlock`,
    method: "POST",
    body,
    logLabel: "BFF LOCKOUT UNLOCK USER",
  });
}