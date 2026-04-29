// src/app/api/v1.0/admin/monitoring/security-timeline/route.ts

export const runtime = "nodejs";

/**
 * Security Timeline BFF Route
 * -----------------------------------------------------------------------------
 * Amaç:
 * - Admin monitoring security timeline verisini standart BFF kapısından sunmak
 * - Web auth cookie-first omurgasına uyumlu kalmak
 * - Tenant / correlation-id / language / refresh / retry davranışlarını
 *   merkezi proxy helper'a bırakmak
 *
 * Upstream:
 * - GET /api/v1.0/admin/monitoring/security-timeline
 */

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const LOG_LABEL = "SecurityTimeline.GET";
const BACKEND_ROUTE = "/api/v1.0/admin/monitoring/security-timeline";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.search || "";

    return await proxyJsonWithWebAuth(req, {
      url: `${BACKEND_ROUTE}${search}`,
      method: "GET",
      logLabel: LOG_LABEL,
    });
  } catch (error) {
    console.error(`[BFF][${LOG_LABEL}][EX]`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        success: false,
        message: "BFF security timeline request failed.",
        userMessage: "Güvenlik zaman çizelgesi alınamadı.",
        data: null,
      },
      { status: 500 }
    );
  }
}