export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveBackendUrl } from "@/lib/bff/webAuthProxyCore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const namespace =
    searchParams.get("namespace")?.trim() ||
    searchParams.get("ns")?.trim() ||
    "";

  const contains = searchParams.get("contains")?.trim() ?? "";
  const cultures = searchParams.getAll("cultures").filter(Boolean);

  const upstreamParams = new URLSearchParams();

  if (namespace) {
    upstreamParams.set("ns", namespace);
  }

  if (contains) {
    upstreamParams.set("contains", contains);
  }

  for (const culture of cultures) {
    upstreamParams.append("cultures", culture);
  }

  return proxyJsonWithWebAuth(req, {
    url: resolveBackendUrl(
      
      `/api/v1.0/localization/manager/search/multi-culture?${upstreamParams.toString()}`
    ),
    method: "GET",
    timeoutMs: 60_000,
    logLabel: "LocalizationManager.Search.GET",
  });
}