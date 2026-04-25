import { NextResponse } from "next/server";
import { Agent, setGlobalDispatcher } from "undici";
import crypto from "node:crypto";

export const runtime = "nodejs";

const BACKEND_BASE =
  process.env.BACKEND_BASE || process.env.BACKEND_URL || "https://localhost:5002";
const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  const insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });
  setGlobalDispatcher(insecureAgent);
}

function correlationId() {
  return crypto.randomUUID();
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 10_000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function POST(req: Request) {
  const cid = correlationId();

  try {
    const bodyText = await req.text(); // sendBeacon text/plain olabilir
    let payload: any;
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      payload = { raw: bodyText };
    }

    // Zengin meta: UA, IP, ts
    const ua = req.headers.get("user-agent") ?? "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "";
    const enriched = {
      ...payload,
      meta: { cid, ua, ip, ts: new Date().toISOString() },
    };

    const url = `${BACKEND_BASE}/api/v1/tr/audit/ui`; // gerekirse locale’i ekleyebilirsin
    const upstream = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-correlation-id": cid },
      body: JSON.stringify(enriched),
      cache: "no-store",
    });

    console.info(`[audit/ui] cid=${cid} status=${upstream.status}`);

    // UI’yı bozmamak için hep 200; semantik hata ok:false
    return NextResponse.json(
      upstream.ok ? { ok: true } : { ok: false, error: "UPSTREAM_FAILED" },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "AUDIT_ERROR" }, { status: 200 });
  }
}
