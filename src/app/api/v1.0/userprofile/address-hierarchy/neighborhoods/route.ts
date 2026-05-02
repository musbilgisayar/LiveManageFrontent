// src/app/api/v1.0/userprofile/address-hierarchy/neighborhoods/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export const runtime = "nodejs";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

function normalizeNeighborhoodList(payload: unknown): any[] {
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
    message: safePayload.message ?? "Mahalle/köy listesi başarıyla getirildi.",
    userMessage:
      safePayload.userMessage ?? "Mahalle/köy listesi başarıyla getirildi.",
    data: normalizeNeighborhoodList(payload),
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
      safePayload.message ||
      "Mahalle/köy listesi alınırken backend hatası oluştu.",
    userMessage:
      safePayload.userMessage ||
      "Mahalle/köy listesi alınırken bir hata oluştu.",
    data: normalizeNeighborhoodList(safePayload.data),
  };
}

export async function GET(req: NextRequest) {
  const districtId = req.nextUrl.searchParams.get("districtId")?.trim();

  if (!districtId) {
    return NextResponse.json(
      {
        ok: false,
        message: "districtId zorunludur.",
        userMessage: "İlçe bilgisi zorunludur.",
        data: [],
      },
      { status: 400 }
    );
  }

  const query = new URLSearchParams({ districtId }).toString();

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/profile/address-hierarchy/neighborhoods?${query}`,
    method: "GET",
    timeoutMs: 10_000,
    logLabel: "AddressHierarchyNeighborhoods",
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