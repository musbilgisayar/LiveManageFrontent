import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  process.env.BACKEND_BASE ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://localhost:5002";

const UPSTREAM_PATH = "/api/v1.0/Account/forgot-password";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "missing_email" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_BASE}${UPSTREAM_PATH}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "accept-language": req.headers.get("accept-language") ?? "tr-TR",
        "x-tenant-key": req.headers.get("x-tenant-key") ?? "default",
        "x-correlation-id":
          req.headers.get("x-correlation-id") ?? crypto.randomUUID(),
      },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    const json = await res.json().catch(async () => {
      const text = await res.text().catch(() => "");
      return { ok: false, error: "invalid_json", details: text };
    });

    return NextResponse.json(json, {
      status: res.status,
      headers: {
        "x-correlation-id":
          req.headers.get("x-correlation-id") ?? crypto.randomUUID(),
      },
    });
  } catch (err: any) {
    console.error("❌ Forgot-password proxy error:", err);

    return NextResponse.json(
      {
        ok: false,
        error: "proxy_error",
        detail: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}