import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

interface Context {
  params: Promise<{
    userId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: Context
) {
  const { userId } = await context.params;

  return proxyJsonWithWebAuth(request, {
    url: `/api/v1.0/user-permissions/${userId}`,
    method: "GET",
    logLabel: "USER_PERMISSIONS_GET",
  });
}