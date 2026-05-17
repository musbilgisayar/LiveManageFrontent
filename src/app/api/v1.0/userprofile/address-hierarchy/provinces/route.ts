// src/app/api/v1.0/userprofile/address-hierarchy/provinces/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyReadOnlyLookupWithServiceFallback } from "@/lib/bff/proxyReadOnlyLookupWithServiceFallback";

export const runtime = "nodejs";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

function normalizeProvinceList(payload: unknown): unknown[] {
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
      ? (payload as Record<string, unknown>)
      : {};

  return {
    ok:
      typeof safePayload.ok === "boolean"
        ? safePayload.ok
        : true,
    message:
      typeof safePayload.message === "string"
        ? safePayload.message
        : "İl listesi başarıyla getirildi.",
    userMessage:
      typeof safePayload.userMessage === "string"
        ? safePayload.userMessage
        : "İl listesi başarıyla getirildi.",
    data: normalizeProvinceList(payload),
  };
}

function createErrorResponse(payload: unknown) {
  const safePayload =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    ok: false,
    message:
      typeof safePayload.message === "string"
        ? safePayload.message
        : "İl listesi alınırken backend hatası oluştu.",
    userMessage:
      typeof safePayload.userMessage === "string"
        ? safePayload.userMessage
        : "İl listesi alınırken bir hata oluştu.",
    data: normalizeProvinceList(safePayload.data),
  };
}

export async function GET(req: NextRequest) {
  const countryCode = req.nextUrl.searchParams
    .get("countryCode")
    ?.trim()
    .toUpperCase();

  if (!countryCode) {
    return NextResponse.json(
      {
        ok: false,
        message: "countryCode zorunludur.",
        userMessage: "Ülke bilgisi zorunludur.",
        data: [],
      },
      { status: 400 }
    );
  }

  const query = new URLSearchParams({ countryCode }).toString();

  return proxyReadOnlyLookupWithServiceFallback(req, {
    url: `/api/v${API_VERSION}/profile/address-hierarchy/provinces?${query}`,
    timeoutMs: 10_000,
    logLabel: "AddressHierarchyProvinces",
    extraHeaders: {
      "x-client-version": "lm-frontend/locmgr-1.0.2",
    },
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
