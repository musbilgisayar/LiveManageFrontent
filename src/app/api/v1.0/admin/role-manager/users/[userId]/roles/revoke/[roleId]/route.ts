export const runtime = "nodejs";

/**
 * Role Manager Revoke Role BFF Route
 * -----------------------------------------------------------------------------
 * Upstream:
 * - POST /api/v1.0/admin/users/{userId}/roles/revoke/{roleId}
 */

import { NextRequest, NextResponse } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

type RouteContext = {
  params: Promise<{
    userId: string;
    roleId: string;
  }>;
};

const LOG_LABEL = "RoleManagerRevokeRole.POST";

export async function POST(
  req: NextRequest,
  context: RouteContext,
) {
  try {
    const { userId, roleId } =
      await context.params;

    const body =
      await req.json().catch(() => null);

    const upstreamUrl =
      `/api/v1.0/admin/users/${userId}/roles/revoke/${roleId}`;

    return await proxyJsonWithWebAuth(req, {
      url: upstreamUrl,
      method: "POST",
      body,
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
          "BFF revoke role request failed.",
        userMessage:
          "Rol kaldırma işlemi başarısız oldu.",
        data: null,
      },
      { status: 500 },
    );
  }
}