import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

type Ctx = {
  params: Promise<{
    applicationId: string;
  }>;
};

export async function GET(req: NextRequest, ctx: Ctx) {
  const { applicationId } = await ctx.params;

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/superadmin/property-management/applications/${encodeURIComponent(
      applicationId,
    )}`,
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "SuperAdminManagementApplication.Detail",
    disableTenantHeader: true,
  });
}
