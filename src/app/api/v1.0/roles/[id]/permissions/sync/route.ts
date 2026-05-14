import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  return proxyJsonWithWebAuth(request, {
    method: "POST",
    url: `/api/v1.0/role-permissions/${id}/sync`,
    body,
    logLabel: "ROLE_PERMISSION_SYNC_POST",
  });
}