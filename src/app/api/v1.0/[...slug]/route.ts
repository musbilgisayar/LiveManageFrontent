import { NextRequest } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";
import type { WebProxyMethod } from "@/lib/bff/webAuthProxyCore";

type Params = { slug?: string[] };

async function readJsonBody(req: NextRequest): Promise<unknown> {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  const text = await req.text();
  if (!text.trim()) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function handler(req: NextRequest, ctx: { params: Promise<Params> }) {
  await ctx.params;

  const upstreamPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  const body = await readJsonBody(req);

  return proxyJsonWithWebAuth(req, {
    url: upstreamPath,
    method: req.method as WebProxyMethod,
    body,
    timeoutMs: 15_000,
    logLabel: "BFF.CatchAll",
    skipContentTypeInjection: typeof body === "string",
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
