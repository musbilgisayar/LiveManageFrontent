// src/app/api/v1.0/roles/[id]/route.ts

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/AppRole/${id}`,
    method: "DELETE",
    timeoutMs: 15_000,
    logLabel: "RoleDelete",
  });
}