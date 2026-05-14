import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function POST(
  request: NextRequest
) {
  const body = await request.json();

  return proxyJsonWithWebAuth(request, {
    url: "/api/v1.0/user-permissions/revoke",
    method: "POST",
    body,
    logLabel: "USER_PERMISSION_REVOKE",
  });
}