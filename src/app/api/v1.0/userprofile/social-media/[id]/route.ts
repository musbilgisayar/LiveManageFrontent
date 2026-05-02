// src/app/api/v1.0/userprofile/social-media/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function buildBadRequestResponse(
  correlationId: string,
  body: Record<string, unknown>
) {
  return NextResponse.json(body, {
    status: 400,
    headers: {
      "x-correlation-id": correlationId,
    },
  });
}

function validateId(id?: string, correlationId?: string) {
  if (!id) {
    return buildBadRequestResponse(correlationId ?? "", {
      ok: false,
      message: "Id is required.",
      userMessage: "Sosyal medya kaydı bulunamadı.",
      errors: { id: ["Id is required."] },
    });
  }

  return null;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const correlationId = resolveCorrelationId(req);
  const { id } = await context.params;

  const validation = validateId(id, correlationId);
  if (validation) return validation;

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/profile/social-media/${id}`,
    method: "GET",
    logLabel: "SocialMedia.GetById",
  });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const correlationId = resolveCorrelationId(req);
  const { id } = await context.params;

  const validation = validateId(id, correlationId);
  if (validation) return validation;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return buildBadRequestResponse(correlationId, {
      ok: false,
      message: "Body is required.",
      userMessage: "Güncellenecek veri eksik.",
    });
  }

  if (!body) {
    return buildBadRequestResponse(correlationId, {
      ok: false,
      message: "Body is required.",
      userMessage: "Güncellenecek veri eksik.",
    });
  }

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/profile/social-media/${id}`,
    method: "PUT",
    body,
    logLabel: "SocialMedia.Update",
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const correlationId = resolveCorrelationId(req);
  const { id } = await context.params;

  const validation = validateId(id, correlationId);
  if (validation) return validation;

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/profile/social-media/${id}`,
    method: "DELETE",
    logLabel: "SocialMedia.Delete",
  });
}