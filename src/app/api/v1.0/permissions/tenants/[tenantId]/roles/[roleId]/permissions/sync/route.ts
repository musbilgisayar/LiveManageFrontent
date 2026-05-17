import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string; roleId: string }> }
) {
  const { tenantId, roleId } = await context.params;

  const body = await request.text();

  return proxyJsonWithWebAuth(request, {
    method: "POST",
    url: `/api/v1.0/admin/permissions/tenants/${tenantId}/roles/${roleId}/permissions/sync`,
    body,
    logLabel: "ADMIN_PERMISSION_TENANT_ROLE_PERMISSION_SYNC_POST",
  });
}