// src/app/api/v1.0/role-permissions/assign/route.ts

import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function POST(request: NextRequest) {
  const body = await request.json();

  return proxyJsonWithWebAuth(request, {
    method: "POST",
    url: "/api/v1.0/role-permissions/assign",
    body,
    extraHeaders: {
      "content-type": "application/json",
      accept: "application/json",
    },
    logLabel: "ROLE_PERMISSION_ASSIGN_POST",
  });
}