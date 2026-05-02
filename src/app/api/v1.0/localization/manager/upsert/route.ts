// src/app/api/v1.0/localization/manager/upsert/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

function resolveCultureFromBody(
  body: Record<string, unknown> | null,
  fallbackCulture: string
): string {
  const fromBody =
    typeof body?.culture === "string" && body.culture.trim()
      ? body.culture.trim()
      : typeof body?.cultureCode === "string" && body.cultureCode.trim()
        ? body.cultureCode.trim()
        : "";

  return fromBody || fallbackCulture;
}

function createSuccessResponse(payload: unknown) {
  const safePayload =
    payload && typeof payload === "object"
      ? (payload as Record<string, any>)
      : {};

  return {
    ok: safePayload.ok ?? true,
    message: safePayload.message ?? "Localization upsert başarılı.",
    userMessage:
      safePayload.userMessage ?? "Çeviri kaydetme işlemi başarılı.",
    data: safePayload.data ?? payload ?? null,
  };
}

function createErrorResponse(payload: unknown) {
  const safePayload =
    payload && typeof payload === "object"
      ? (payload as Record<string, any>)
      : {};

  return {
    ok: false,
    message:
      safePayload.message ??
      "Localization upsert sırasında backend hatası oluştu.",
    userMessage:
      safePayload.userMessage ??
      "Çeviri kaydetme işlemi sırasında bir hata oluştu.",
    data: safePayload.data ?? null,
    error: safePayload.error ?? null,
  };
}

function buildBadRequest(correlationId: string) {
  return NextResponse.json(
    {
      ok: false,
      message: "Geçersiz request body.",
      userMessage: "Gönderilen veri okunamadı.",
      data: null,
      error: "INVALID_BODY",
    },
    {
      status: 400,
      headers: {
        "x-correlation-id": correlationId,
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return buildBadRequest(correlationId);
  }

  const bodyJson =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;

  if (!bodyJson) {
    return buildBadRequest(correlationId);
  }

  const acceptLanguage = req.headers.get("accept-language") || "tr";
  const culture = resolveCultureFromBody(bodyJson, acceptLanguage);

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/${encodeURIComponent(
      culture
    )}/localization/manager/upsert`,
    method: "POST",
    body: bodyJson,
    timeoutMs: 10_000,
    logLabel: "Localization.Manager.Upsert.POST",
    transformResponse: (payload, context) => {
      const headers = new Headers();
      headers.set("x-correlation-id", context.correlationId);

      if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
        return {
          body: createSuccessResponse(payload),
          status: 200,
          headers,
        };
      }

      return {
        body: createErrorResponse(payload),
        status: context.upstreamStatus,
        headers,
      };
    },
  });
}