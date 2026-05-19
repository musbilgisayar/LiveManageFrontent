import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

function shouldUseGlobalScope(req: NextRequest): boolean {
  const scope = req.nextUrl.searchParams.get("scope")?.trim().toLowerCase();
  return scope === "all" || scope === "global";
}

export async function GET(req: NextRequest) {
  const globalScope = shouldUseGlobalScope(req);

  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/admin/property-management/applications/pending",
    method: "GET",
    timeoutMs: 15_000,
    logLabel: globalScope
      ? "AdminManagementApplications.Pending.Global"
      : "AdminManagementApplications.Pending.Tenant",
    disableTenantHeader: globalScope,
  });
}
