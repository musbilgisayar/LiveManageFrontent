import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await context.params;

  return proxyJsonWithWebAuth(request, {
    method: "POST",
    url: `/api/v1.0/admin/permissions/tenants/${tenantId}/sync`,
    logLabel: "ADMIN_PERMISSION_TENANT_SYNC_POST",
  });
}