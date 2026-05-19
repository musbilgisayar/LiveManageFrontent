import { NextRequest } from "next/server";

import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

type Ctx = {
  params: Promise<{
    applicationId: string;
  }>;
};

async function readJsonBody(req: NextRequest): Promise<unknown> {
  const text = await req.text();
  if (!text.trim()) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { applicationId } = await ctx.params;

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/admin/property-management/applications/${encodeURIComponent(
      applicationId,
    )}/request-document`,
    method: "POST",
    body: await readJsonBody(req),
    timeoutMs: 15_000,
    logLabel: "AdminManagementApplication.RequestDocument",
  });
}
