export const runtime = "nodejs";

/**
 * Role Manager User Role History BFF Route
 * -----------------------------------------------------------------------------
 * Upstream:
 * - GET /api/v1.0/admin/users/{userId}/roles/history
 */

import { NextRequest, NextResponse } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

const LOG_LABEL = "RoleManagerUserRoleHistory.GET";

export async function GET(
  req: NextRequest,
  context: RouteContext,
) {
  try {
    const { userId } = await context.params;

    const upstreamUrl =
      `/api/v1.0/admin/users/${userId}/roles/history`;

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
          "BFF user role history request failed.",
        userMessage:
          "Rol geçmişi alınamadı.",
        data: null,
      },
      { status: 500 },
    );
  }
}