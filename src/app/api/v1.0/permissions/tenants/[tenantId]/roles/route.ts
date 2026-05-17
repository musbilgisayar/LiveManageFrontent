import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await context.params;

  return proxyJsonWithWebAuth(request, {
    method: "GET",
    url: `/api/v1.0/admin/permissions/tenants/${tenantId}/roles`,
    logLabel: "ADMIN_PERMISSION_TENANT_ROLES_GET",
  });
}