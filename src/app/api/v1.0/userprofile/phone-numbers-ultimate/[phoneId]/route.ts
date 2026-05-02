// src/app/api/v1.0/userprofile/phone-numbers/[phoneId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";

export const runtime = "nodejs";

const LOG_PREFIX = "UserPhoneNumbers";

type RouteContext = {
  params: Promise<{ phoneId: string }>;
};

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

export async function PUT(req: NextRequest, context: RouteContext) {
  const correlationId = resolveCorrelationId(req);
  const { phoneId } = await context.params;
  const routePhoneId = phoneId?.trim();

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return buildValidationError(
      correlationId,
      "Request body is required.",
      "Güncellenecek telefon bilgisi eksik.",
      "body"
    );
  }

  const parsedBody =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;

  if (!parsedBody) {
    return buildValidationError(
      correlationId,
      "Request body is required.",
      "Güncellenecek telefon bilgisi eksik.",
      "body"
    );
  }

  if (!parsedBody.phoneId && routePhoneId) {
    parsedBody.phoneId = routePhoneId;
  }

  const effectivePhoneId =
    typeof parsedBody.phoneId === "string"
      ? parsedBody.phoneId.trim()
      : parsedBody.phoneId;

  if (!effectivePhoneId) {
    return buildValidationError(
      correlationId,
      "phoneId is required.",
      "Telefon bilgisi eksik.",
      "phoneId"
    );
  }

  parsedBody.phoneId = effectivePhoneId;

  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/identity/AppUser/phone-numbers",
    method: "PUT",
    body: parsedBody,
    logLabel: `${LOG_PREFIX}.PUT`,
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const correlationId = resolveCorrelationId(req);
  const { phoneId } = await context.params;

  const effectivePhoneId = phoneId?.trim();

  if (!effectivePhoneId) {
    return buildValidationError(
      correlationId,
      "phoneId is required.",
      "Telefon bilgisi eksik.",
      "phoneId"
    );
  }

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/identity/AppUser/phone-numbers/${encodeURIComponent(
      effectivePhoneId
    )}`,
    method: "DELETE",
    logLabel: `${LOG_PREFIX}.DELETE`,
  });
}