// src/app/api/v1.0/[lang]/profile/addresses/route.ts

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

type RouteContext = {
  params: Promise<{ lang: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { lang } = await context.params;

  if (process.env.NODE_ENV !== "production") {
    console.info(`🌍 [${lang}] GET → /api/v1.0/profile/addresses`);
  }

  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/profile/addresses",
    method: "GET",
    logLabel: "ProfileAddresses.GET",
  });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { lang } = await context.params;
  const body = await req.json().catch(() => null);

  if (process.env.NODE_ENV !== "production") {
    console.info(`🌍 [${lang}] POST → /api/v1.0/profile/addresses`);
  }

  return proxyJsonWithWebAuth(req, {
    url: "/api/v1.0/profile/addresses",
    method: "POST",
    body,
    logLabel: "ProfileAddresses.POST",
  });
}