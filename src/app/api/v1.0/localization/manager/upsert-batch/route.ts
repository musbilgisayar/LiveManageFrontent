export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import { resolveBackendUrl } from "@/lib/bff/webAuthProxyCore";

type UpsertBatchRequest = {
  namespace: string;
  key: string;
  values: Record<string, string>;
  reason?: string | null;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as UpsertBatchRequest | null;

  return proxyJsonWithWebAuth(req, {
    url: resolveBackendUrl("/api/v1.0/localization/manager/upsert-batch"),
    method: "POST",
    body,
    timeoutMs: 20_000,
    logLabel: "LocalizationManager.UpsertBatch.POST",
  });
}