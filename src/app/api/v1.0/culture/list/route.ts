export const runtime = "nodejs";

/**
 * Culture List BFF Route
 * -----------------------------------------------------------------------------
 * Amaç:
 * - Frontend tarafı için kültür/dil listesini standart BFF kapısından sunmak
 * - Web auth cookie-first omurgasına uyumlu kalmak
 * - Tenant / correlation-id / language / refresh / retry davranışlarını
 *   merkezi proxy helper'a bırakmak
 *
 * Neden bu kadar ince?
 * - Bu route artık auth, retry, timeout, cookie merge gibi altyapı davranışlarını
 *   kendisi yazmaz.
 * - Tüm bu sorumluluklar proxyJsonWithWebAuth + webAuthProxyCore içinde çözülür.
 * - Böylece route sade, bakım dostu ve tutarlı kalır.
 *
 * Upstream:
 * - GET /api/v1.0/culture/list
 */

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const LOG_LABEL = "CultureList.GET";
const BACKEND_ROUTE = "/api/v1.0/culture/list";

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
        message: "BFF culture list request failed.",
        userMessage: "Dil listesi alınamadı.",
        data: [],
      },
      { status: 500 }
    );
  }
}