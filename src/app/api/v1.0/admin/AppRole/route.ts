export const runtime = "nodejs";

/**
 * App Role List BFF Route
 * -----------------------------------------------------------------------------
 * Amaç:
 * - Sistem rollerini standart BFF katmanından sunmak
 * - Role assignment/filter dropdown ihtiyaçlarını desteklemek
 * - Web auth cookie-first mimarisi ile uyumlu çalışmak
 * - Tenant / correlation-id / language / refresh / retry davranışlarını
 *   merkezi proxy helper'a bırakmak
 *
 * Upstream:
 * - GET /api/v1.0/AppRole
 */

import { NextRequest, NextResponse } from "next/server";

import { proxyJsonWithWebAuth }
  from "@/lib/bff/proxyJsonWithWebAuth";

const LOG_LABEL = "AppRole.GET";

const BACKEND_ROUTE =
  "/api/v1.0/AppRole";

export async function GET(req: NextRequest) {
  try {
    return await proxyJsonWithWebAuth(req, {
      url: BACKEND_ROUTE,
      method: "GET",
      logLabel: LOG_LABEL,
    });
  } catch (error) {
    console.error(`[BFF][${LOG_LABEL}][EX]`, {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        success: false,
        message:
          "BFF app role request failed.",
        userMessage:
          "Rol listesi alınamadı.",
        data: null,
      },
      { status: 500 },
    );
  }
}