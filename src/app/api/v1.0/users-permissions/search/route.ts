//src/app/api/v1.0/users-permissions/search/route.ts

import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(
  request: NextRequest
) {
  const searchParams = request.nextUrl.searchParams;

  const q = searchParams.get("q") || "";

  const upstreamQuery = new URLSearchParams();

  if (q.trim()) {
    upstreamQuery.set("q", q);
  }

  return proxyJsonWithWebAuth(request, {
    
    url: `/api/v1.0/identity/AppUser?${upstreamQuery.toString()}`,
    method: "GET",
    logLabel: "PERMISSION_USER_SEARCH",
  });
}