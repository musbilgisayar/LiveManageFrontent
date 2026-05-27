// src/app/api/v1.0/userprofile/addresses/route.ts
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(req: NextRequest) {
  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/profile/addresses",
    method: "GET",
    logLabel: "UserProfileAddresses.GET",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/profile/addresses",
    method: "POST",
    body,
    logLabel: "UserProfileAddresses.POST",
  });
}