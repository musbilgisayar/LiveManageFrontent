import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/property-management/applications",
    method: "POST",
    body,
    timeoutMs: 20_000,
    logLabel: "ManagementApplicationCreate",
  });
}

export async function GET(req: NextRequest) {
  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/property-management/applications/my",
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "ManagementApplicationMyList",
  });
}