// src/app/api/v1.0/roles/[id]/permissions/route.ts

import type { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return proxyJsonWithWebAuth(request, {
    method: "GET",
    url: `/api/v1.0/role-permissions/${id}/matrix`,
    logLabel: "ROLE_PERMISSION_MATRIX_GET",
  });
}