// src/app/api/v1.0/profile/address-hierarchy/countries/route.ts

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

function normalizeCountryList(payload: unknown): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      return obj.data;
    }
  }

  return [];
}

function createSuccessResponse(payload: unknown) {
  const data = normalizeCountryList(payload);

  return {
    ok: (payload as any)?.ok ?? true,
    message: (payload as any)?.message ?? "Ülke listesi başarıyla getirildi.",
    userMessage:
      (payload as any)?.userMessage ?? "Ülke listesi başarıyla getirildi.",
    data,
  };
}

function createErrorResponse(payload: unknown) {
  const data = normalizeCountryList((payload as any)?.data);

  return {
    ok: false,
    message:
      (payload as any)?.message ||
      "Ülke listesi alınırken backend hatası oluştu.",
    userMessage:
      (payload as any)?.userMessage ||
      "Ülke listesi alınırken bir hata oluştu.",
    data,
  };
}

export async function GET(req: NextRequest) {
  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/profile/address-hierarchy/countries`,
    method: "GET",
    timeoutMs: 10_000,
    logLabel: "AddressHierarchyCountries",
    transformResponse: (payload, context) => {
      const body =
        context.upstreamStatus >= 200 && context.upstreamStatus < 300
          ? createSuccessResponse(payload)
          : createErrorResponse(payload);

      return {
        body,
        status: context.upstreamStatus,
        headers: {
          "x-correlation-id": context.correlationId,
        },
      };
    },
  });
}