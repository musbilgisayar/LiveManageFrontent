export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest } from "next/server";
import { proxyMultipartWithWebAuth } from "@/lib/bff/proxyMultipartWithWebAuth";

const UPSTREAM_PATH =
  "/api/v1.0/property-management/applications/documents/upload-file";

export async function POST(req: NextRequest) {
  return proxyMultipartWithWebAuth(req, {
    url: UPSTREAM_PATH,
    method: "POST",
    timeoutMs: 60_000,
    logLabel: "PropertyManagement.ApplicationDocument.Upload",
  });
}
