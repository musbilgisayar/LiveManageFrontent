// src/app/api/v1.0/superadmin/users/[userId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

function buildBadRequest(
  correlationId: string,
  message: string,
  userMessage?: string
) {
  return NextResponse.json(
    {
      ok: false,
      message,
      userMessage: userMessage ?? message,
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

export async function PATCH(req: NextRequest, context: RouteContext) {
  const correlationId = resolveCorrelationId(req);
  const { userId } = await context.params;
  const effectiveUserId = userId?.trim();

  if (!effectiveUserId) {
    return buildBadRequest(
      correlationId,
      "UserId zorunludur.",
      "Kullanıcı bilgisi eksik."
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return buildBadRequest(
      correlationId,
      "Request body zorunludur.",
      "Güncellenecek kullanıcı verisi eksik."
    );
  }

  if (!body || typeof body !== "object") {
    return buildBadRequest(
      correlationId,
      "Request body zorunludur.",
      "Güncellenecek kullanıcı verisi eksik."
    );
  }

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/identity/AppUser/${encodeURIComponent(effectiveUserId)}`,
    method: "PATCH",
    body,
    logLabel: "SuperAdmin.Users.PATCH",
  });
}