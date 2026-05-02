// src/app/api/v1.0/userprofile/address-hierarchy/districts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export const runtime = "nodejs";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

function normalizeDistrictList(payload: unknown): any[] {
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
  const safePayload =
    payload && typeof payload === "object"
      ? (payload as Record<string, any>)
      : {};

  return {
    ok: safePayload.ok ?? true,
    message: safePayload.message ?? "İlçe listesi başarıyla getirildi.",
    userMessage:
      safePayload.userMessage ?? "İlçe listesi başarıyla getirildi.",
    data: normalizeDistrictList(payload),
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
      safePayload.message || "İlçe listesi alınırken backend hatası oluştu.",
    userMessage:
      safePayload.userMessage ||
      "İlçe listesi alınırken bir hata oluştu.",
    data: normalizeDistrictList(safePayload.data),
  };
}

export async function GET(req: NextRequest) {
  const provinceId = req.nextUrl.searchParams.get("provinceId")?.trim();

  if (!provinceId) {
    return NextResponse.json(
      {
        ok: false,
        message: "provinceId zorunludur.",
        userMessage: "İl bilgisi zorunludur.",
        data: [],
      },
      { status: 400 }
    );
  }

  const query = new URLSearchParams({ provinceId }).toString();

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/profile/address-hierarchy/districts?${query}`,
    method: "GET",
    timeoutMs: 10_000,
    logLabel: "AddressHierarchyDistricts",
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