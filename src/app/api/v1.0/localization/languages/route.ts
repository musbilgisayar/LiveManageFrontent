export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveBackendUrl } from "@/lib/bff/webAuthProxyCore";

export async function GET(req: NextRequest) {
  return proxyJsonWithWebAuth(req, {
    url: resolveBackendUrl("/api/v1.0/culture/list"),
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "LocalizationLanguages.GET",
  });
}