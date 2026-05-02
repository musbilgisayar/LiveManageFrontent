// src/app/api/v1.0/localization/manager/keys/all/route.ts

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_VERSION = "1.0";

export async function GET(req: NextRequest) {
  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/localization/manager/keys/all`,
    method: "GET",
    logLabel: "LocalizationKeysAll.GET",
    extraHeaders: {
      "x-client-version": "lm-bff/localization-keys-all-1.0.0",
    },
    responseHeaders: {
      "cache-control": "no-store, no-cache, must-revalidate",
      pragma: "no-cache",
      expires: "0",
    },
  });
}