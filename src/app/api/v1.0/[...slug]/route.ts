import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.LM_BACKEND_BASE ?? "https://localhost:5002";
const DEFAULT_TENANT =
  process.env.LM_DEFAULT_TENANT ??
  process.env.NEXT_PUBLIC_DEFAULT_TENANT ??
  "default";

function makeCid() {
  // @ts-ignore
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

type Params = { slug?: string[] };

function resolveTenantKey(req: NextRequest) {
  const fromHeader = req.headers.get("x-tenant-key")?.trim();
  if (fromHeader) {
    return { tenantKey: fromHeader, source: "header" };
  }

  const fromCookie =
    req.cookies.get("lm.tenant")?.value?.trim() ||
    req.cookies.get("tenantKey")?.value?.trim();

  if (fromCookie) {
    return { tenantKey: fromCookie, source: "cookie" };
  }

  return { tenantKey: DEFAULT_TENANT, source: "fallback(bff)" };
}

function appendSetCookies(source: Headers, target: Headers) {
  const getSetCookieFn = (source as any).getSetCookie;

  if (typeof getSetCookieFn === "function") {
    const cookies: string[] = getSetCookieFn.call(source) ?? [];
    if (cookies.length > 0) {
      cookies.forEach((cookie) => target.append("set-cookie", cookie));
      return cookies.length;
    }
  }

  const single = source.get("set-cookie");
  if (single) {
    target.append("set-cookie", single);
    return 1;
  }

  return 0;
}

async function readUpstreamBody(upstream: Response): Promise<{
  data: unknown;
  contentType: string;
}> {
  const contentType = upstream.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const json = await upstream.json();
      return { data: json, contentType };
    } catch {
      return { data: null, contentType };
    }
  }

  try {
    const text = await upstream.text();
    return { data: text, contentType };
  } catch {
    return { data: "", contentType };
  }
}

async function handler(
  req: NextRequest,
  ctx: { params: Promise<Params> }
) {
  await ctx.params;

  const relativePath = req.nextUrl.pathname;
  const upstreamUrl = `${BACKEND}${relativePath}${req.nextUrl.search}`;

  const correlationId = req.headers.get("x-correlation-id") ?? makeCid();
  const { tenantKey, source: tenantSource } = resolveTenantKey(req);

  const headers = new Headers(req.headers);
  const hasCookie = !!req.headers.get("cookie");
  const hasAuthorization = !!req.headers.get("authorization");

  // Web auth standardı:
  // Cookie varsa stale/expired authorization backend'e forward edilmesin.
  if (hasCookie) {
    headers.delete("authorization");
  }

  headers.set("x-correlation-id", correlationId);
  headers.set("x-client-version", "lm-frontend/locmgr-1.0.2");
  headers.set("X-Tenant-Key", tenantKey);

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  console.group("🟦 [BFF CATCH-ALL]");
  console.info("➡️ [BFF CATCH-ALL] İstek başladı", {
    correlationId,
    method: req.method,
    relativePath,
    upstreamUrl,
    tenantKey,
    tenantSource,
    hasCookie,
    hasAuthorization,
  });

  let upstream: Response;

  try {
    upstream = await fetch(upstreamUrl, init);
  } catch (e: any) {
    console.error("🟥 [BFF CATCH-ALL] Upstream ağ hatası", {
      correlationId,
      tenantKey,
      method: req.method,
      upstreamUrl,
      message: String(e),
    });

    console.groupEnd();

    return NextResponse.json(
      {
        message: "Upstream ağına bağlanılamadı.",
        detail: String(e),
      },
      { status: 502 }
    );
  }

  const { data, contentType } = await readUpstreamBody(upstream);

  if (!upstream.ok) {
    console.warn("⚠️ [BFF CATCH-ALL] Upstream başarısız döndü", {
      correlationId,
      tenantKey,
      status: upstream.status,
      contentType,
      data,
    });

    let errorResponse: NextResponse;

    if (contentType.includes("application/json")) {
      errorResponse = NextResponse.json(data, { status: upstream.status });
    } else {
      errorResponse = new NextResponse(typeof data === "string" ? data : "", {
        status: upstream.status,
        headers: contentType
          ? { "content-type": contentType }
          : undefined,
      });
    }

    errorResponse.headers.set("x-correlation-id", correlationId);
    appendSetCookies(upstream.headers, errorResponse.headers);

    console.groupEnd();
    return errorResponse;
  }

  let response: NextResponse;

  if (contentType.includes("application/json")) {
    response = NextResponse.json(data, { status: upstream.status });
  } else {
    response = new NextResponse(typeof data === "string" ? data : "", {
      status: upstream.status,
      headers: contentType
        ? { "content-type": contentType }
        : undefined,
    });
  }

  response.headers.set("x-correlation-id", correlationId);
  appendSetCookies(upstream.headers, response.headers);

  console.info("✅ [BFF CATCH-ALL] İstek başarıyla tamamlandı", {
    correlationId,
    tenantKey,
    status: upstream.status,
  });

  console.groupEnd();
  return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;