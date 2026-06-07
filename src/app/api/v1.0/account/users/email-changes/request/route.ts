// src/app/api/v1.0/account/users/email-changes/request/route.ts

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const UPSTREAM_PATH = "/api/v1.0/identity/AppUser/email-change/request";

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const contentType = req.headers.get("content-type") || "application/json";

  return proxyJsonWithWebAuth(req, {
    url: UPSTREAM_PATH,
    method: "POST",
    body: bodyText || undefined,
    extraHeaders: {
      "content-type": contentType,
    },
    skipContentTypeInjection: true,
    logLabel: "AccountEmailChangeRequest",
  });
}
