//src/app/api/v1.0/role-permissions/[roleId]/matrix/route.ts
import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string; roleId: string }> }
) {
  const { tenantId, roleId } = await context.params;

  return proxyJsonWithWebAuth(request, {
    method: "GET",
    url: `/api/v1.0/admin/permissions/tenants/${tenantId}/roles/${roleId}/matrix`,
    logLabel: "ADMIN_PERMISSION_TENANT_ROLE_MATRIX_GET",
  });
}