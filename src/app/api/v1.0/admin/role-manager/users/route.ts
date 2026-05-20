export const runtime = "nodejs";

/**
 * Role Manager Users BFF Route
 * -----------------------------------------------------------------------------
 * Amaç:
 * - User Role Manager kullanıcı listesini standart BFF katmanından sunmak
 * - Web auth cookie-first mimarisi ile uyumlu çalışmak
 * - Tenant / correlation-id / language / refresh / retry davranışlarını
 *   merkezi proxy helper'a bırakmak
 *
 * Upstream:
 * - GET /api/v1.0/admin/role-manager/users
 */

import { NextRequest, NextResponse } from "next/server";

import { proxyJsonWithWebAuth }
  from "@/lib/bff/proxyJsonWithWebAuth";

const LOG_LABEL = "RoleManagerUsers.GET";

const BACKEND_ROUTE =
  "/api/v1.0/admin/role-manager/users";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.search;

    const upstreamUrl =
      `${BACKEND_ROUTE}${search || ""}`;

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
          "BFF role manager users request failed.",
        userMessage:
          "Rol kullanıcı listesi alınamadı.",
        data: null,
      },
      { status: 500 },
    );
  }
}