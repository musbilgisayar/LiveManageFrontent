import { NextRequest, NextResponse } from "next/server";
import https from "https";

const BACKEND_BASE = process.env.BACKEND_BASE ?? "https://localhost:5002";
const BE_SSL_INSECURE = process.env.BE_SSL_INSECURE === "true";
const agent = BE_SSL_INSECURE ? new https.Agent({ rejectUnauthorized: false }) : undefined;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_BASE}/api/Auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      ...(agent ? { dispatcher: agent } : {}),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("❌ Backend forgot-password error:", text);
      return NextResponse.json({ ok: false, error: "backend_error", details: text }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: text }, { status: 200 });
  } catch (err) {
    console.error("❌ Forgot-password proxy error:", err);
    return NextResponse.json({ ok: false, error: "proxy_error" }, { status: 500 });
  }
}
