// src/app/api/v1.0/profile/social-media/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Body is required.",
        userMessage: "Kaydedilecek sosyal medya verisi eksik.",
      },
      {
        status: 400,
        headers: {
          "x-correlation-id": correlationId,
        },
      }
    );
  }

  if (!body) {
    return NextResponse.json(
      {
        ok: false,
        message: "Body is required.",
        userMessage: "Kaydedilecek sosyal medya verisi eksik.",
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
    url: "/api/v1.0/profile/social-media",
    method: "POST",
    body,
    logLabel: "SocialMedia.Create",
  });
}