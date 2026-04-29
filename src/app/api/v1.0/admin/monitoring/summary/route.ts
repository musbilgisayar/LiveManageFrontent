// src/app/api/v1.0/admin/monitoring/summary/route.ts

export const runtime = "nodejs";

/**
 * Monitoring Summary BFF Route
 * -----------------------------------------------------------------------------
 * Amaç:
 * - Admin monitoring dashboard için özet veriyi standart BFF kapısından sunmak
 * - Web auth cookie-first omurgasına uyumlu kalmak
 * - Tenant / correlation-id / language / refresh / retry davranışlarını
 *   merkezi proxy helper'a bırakmak
 *
 * Upstream:
 * - GET /api/v1.0/admin/monitoring/summary
 */

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const LOG_LABEL = "MonitoringSummary.GET";
const BACKEND_ROUTE = "/api/v1.0/admin/monitoring/summary";

export async function GET(req: NextRequest) {
  try {
    return await proxyJsonWithWebAuth(req, {
      url: BACKEND_ROUTE,
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
        message: "BFF monitoring summary request failed.",
        userMessage: "Monitoring özeti alınamadı.",
        data: null,
      },
      { status: 500 }
    );
  }
}