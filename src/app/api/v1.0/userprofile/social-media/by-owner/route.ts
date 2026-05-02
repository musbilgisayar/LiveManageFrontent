// src/app/api/v1.0/profile/social-media/by-owner/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);

  const ownerType = req.nextUrl.searchParams.get("ownerType")?.trim();
  const ownerId = req.nextUrl.searchParams.get("ownerId")?.trim();

  if (!ownerType || !ownerId) {
    return NextResponse.json(
      {
        success: false,
        message: "ownerType ve ownerId zorunludur.",
        code: "INVALID_REQUEST",
      },
      {
        status: 400,
        headers: {
          "x-correlation-id": correlationId,
        },
      }
    );
  }

  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/profile/social-media/by-owner",
    method: "POST",
    body: {
      ownerType,
      ownerId,
    },
    logLabel: "SocialMediaByOwner.GET",
  });
}