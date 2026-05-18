import { NextRequest } from "next/server";

import { proxyRawWithWebAuth } from "@/lib/bff/proxyRawWithWebAuth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await context.params;

  return proxyRawWithWebAuth(request, {
    method: "GET",
    url: `/api/v1.0/admin/property-management/applications/documents/${documentId}/download`,
    logLabel:
      "admin-property-application-document-download",
    timeoutMs: 60_000,
    streamResponse: true,
  });
}