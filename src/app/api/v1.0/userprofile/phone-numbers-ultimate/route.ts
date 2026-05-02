// src/app/api/v1.0/userprofile/phone-numbers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";

export const runtime = "nodejs";

const LOG_PREFIX = "UserPhoneNumbers";

function buildValidationError(
  correlationId: string,
  message: string,
  userMessage: string,
  field: string
) {
  return NextResponse.json(
    {
      ok: false,
      message,
      userMessage,
      data: null,
      errors: {
        [field]: [message],
      },
    },
    {
      status: 400,
      headers: {
        "x-correlation-id": correlationId,
      },
    }
  );
}

export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);
  const userId = req.nextUrl.searchParams.get("userId")?.trim();

  if (!userId) {
    return buildValidationError(
      correlationId,
      "userId is required.",
      "Kullanıcı bilgisi eksik.",
      "userId"
    );
  }

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/identity/AppUser/${encodeURIComponent(userId)}/phone-numbers`,
    method: "GET",
    logLabel: `${LOG_PREFIX}.GET`,
  });
}

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
        userMessage: "Telefon ekleme verisi eksik.",
        data: null,
      },
      {
        status: 400,
        headers: {
          "x-correlation-id": correlationId,
        },
      }
    );
  }

  const parsedBody =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;

  const userId =
    typeof parsedBody?.userId === "string"
      ? parsedBody.userId.trim()
      : parsedBody?.userId;

  if (!userId) {
    return buildValidationError(
      correlationId,
      "userId is required.",
      "Kullanıcı bilgisi eksik.",
      "userId"
    );
  }

  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/identity/AppUser/phone-numbers",
    method: "POST",
    body: parsedBody,
    logLabel: `${LOG_PREFIX}.POST`,
  });
}