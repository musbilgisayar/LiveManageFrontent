// src/app/api/v1.0/account/users/me/route.ts

import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return proxyJsonWithWebAuth(req, {
    method: "GET",
    url: "/api/v1.0/account/me",
    logLabel: "ACCOUNT_ME_GET",
    responseHeaders: {
      "x-audit-log": "success",
    },
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);

  return proxyJsonWithWebAuth(req, {
    method: "PATCH",
    url: "/api/v1.0/account/me",
    body,
    logLabel: "ACCOUNT_ME_PATCH",
  });
}