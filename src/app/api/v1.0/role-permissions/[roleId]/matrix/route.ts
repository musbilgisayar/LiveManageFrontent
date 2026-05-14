import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await context.params;

  return proxyJsonWithWebAuth(request, {
    method: "GET",
    url: `/api/v1.0/role-permissions/${roleId}/matrix`,
    logLabel: "ROLE_PERMISSION_MATRIX_GET",
  });
}