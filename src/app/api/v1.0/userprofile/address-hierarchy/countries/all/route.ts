// src/app/api/v1.0/userprofile/address-hierarchy/countries/all/route.ts

import { NextRequest } from "next/server";
import { proxyReadOnlyLookupWithServiceFallback } from "@/lib/bff/proxyReadOnlyLookupWithServiceFallback";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

function normalizeCountryList(payload: unknown): unknown[] {
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
    ok: (safePayload.ok as boolean | undefined) ?? true,
    message:
      (safePayload.message as string | undefined) ??
      "Ülke listesi başarıyla getirildi.",
    userMessage:
      (safePayload.userMessage as string | undefined) ??
      "Ülke listesi başarıyla getirildi.",
    data: normalizeCountryList(payload),
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
      (safePayload.message as string | undefined) ??
      "Ülke listesi alınırken backend hatası oluştu.",
    userMessage:
      (safePayload.userMessage as string | undefined) ??
      "Ülke listesi alınırken bir hata oluştu.",
    data: Array.isArray(payload)
      ? payload
      : normalizeCountryList(safePayload.data),
  };
}

export async function GET(req: NextRequest) {
  return proxyReadOnlyLookupWithServiceFallback(req, {
    url: `/api/v${API_VERSION}/profile/address-hierarchy/countries/all`,
    logLabel: "AddressHierarchyCountriesAll.GET",
    extraHeaders: {
      "x-client-version": "lm-frontend/locmgr-1.0.2",
    },
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
