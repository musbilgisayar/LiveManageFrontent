import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

type Ctx = {
  params: Promise<{
    applicationId: string;
  }>;
};

function shouldUseGlobalScope(req: NextRequest): boolean {
  const scope = req.nextUrl.searchParams.get("scope")?.trim().toLowerCase();
  return scope === "all" || scope === "global";
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { applicationId } = await ctx.params;
  const globalScope = shouldUseGlobalScope(req);

  return proxyJsonWithWebAuth(req, {
    

    url: globalScope
  ? `/api/v1.0/superadmin/property-management/applications/${encodeURIComponent(
      applicationId,
    )}`
  : `/api/v1.0/admin/property-management/applications/${encodeURIComponent(
      applicationId,
    )}`,


    method: "GET",
    timeoutMs: 15_000,
    logLabel: globalScope
      ? "AdminManagementApplication.Detail.Global"
      : "AdminManagementApplication.Detail",
    disableTenantHeader: globalScope,
  });
}
