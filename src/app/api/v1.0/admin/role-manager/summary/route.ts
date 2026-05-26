export const runtime = "nodejs";

/**
 * Role Manager Summary BFF Route
 * -----------------------------------------------------------------------------
 * Amaç:
 * - User Role Manager dashboard summary verisini standart BFF katmanından sunmak
 * - Web auth cookie-first mimarisi ile uyumlu çalışmak
 * - Tenant / correlation-id / language / refresh / retry davranışlarını
 *   merkezi proxy helper'a bırakmak
 *
 * Upstream:
 * - GET /api/v1.0/admin/role-manager/summary
 */

import { NextRequest, NextResponse } from "next/server";

import { proxyJsonWithWebAuth }
  from "@/lib/bff/proxyJsonWithWebAuth";

const LOG_LABEL = "RoleManagerSummary.GET";

const BACKEND_ROUTE =
  "/api/v1.0/admin/role-manager/summary";

export async function GET(req: NextRequest) {
  try {
    const upstreamUrl =
      `${BACKEND_ROUTE}${req.nextUrl.search || ""}`;

    return await proxyJsonWithWebAuth(req, {
      url: upstreamUrl,
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
          "BFF role manager summary request failed.",
        userMessage:
          "Rol yönetimi özeti alınamadı.",
        data: null,
      },
      { status: 500 },
    );
  }
}
