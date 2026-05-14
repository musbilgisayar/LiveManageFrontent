import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(request: NextRequest) {
  return proxyJsonWithWebAuth(request, {
    method: "GET",
    url: "/api/v1.0/permissions/modules",
    logLabel: "PERMISSION_MODULES_GET",
  });
}