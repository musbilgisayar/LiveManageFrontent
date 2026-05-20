export const runtime = "nodejs";

/**
 * Role Distribution BFF Route
 * -----------------------------------------------------------------------------
 * Amaç:
 * - User Role Manager role distribution verisini standart BFF katmanından sunmak
 * - Web auth cookie-first mimarisi ile uyumlu çalışmak
 * - Tenant / correlation-id / language / refresh / retry davranışlarını
 *   merkezi proxy helper'a bırakmak
 *
 * Upstream:
 * - GET /api/v1.0/admin/role-manager/roles/distribution
 */

import { NextRequest, NextResponse } from "next/server";

import { proxyJsonWithWebAuth }
  from "@/lib/bff/proxyJsonWithWebAuth";

const LOG_LABEL = "RoleDistribution.GET";

const BACKEND_ROUTE =
  "/api/v1.0/admin/role-manager/roles/distribution";

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
          "BFF role distribution request failed.",
        userMessage:
          "Rol dağılımı alınamadı.",
        data: null,
      },
      { status: 500 },
    );
  }
}