//src/app/api/v1.0/account/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import https from "https";
import { randomUUID } from "crypto";

const BACKEND_BASE = process.env.BACKEND_BASE ?? "https://localhost:5002";
const BE_SSL_INSECURE = process.env.BE_SSL_INSECURE === "true";
const agent = BE_SSL_INSECURE ? new https.Agent({ rejectUnauthorized: false }) : undefined;

export async function POST(req: NextRequest) {
  const corrId = randomUUID();
  const ts = () => new Date().toISOString();

  

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      console.warn(`⚠️ [ResetPassword][${ts()}][cid=${corrId}] JSON parse edilemedi veya boş body geldi.`);
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const { token, newPassword, confirmPassword, email } = body;

    console.info(`📦 [ResetPassword][${ts()}][cid=${corrId}] Gelen parametreler:`, {
      email,
      hasToken: !!token,
      hasNewPassword: !!newPassword,
      hasConfirm: !!confirmPassword,
    });

    if (!token || !newPassword || !confirmPassword || !email) {
      console.warn(`⚠️ [ResetPassword][${ts()}][cid=${corrId}] Eksik alan(lar) bulundu.`);
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const targetUrl = `${BACKEND_BASE}/api/Auth/reset-password`;
   

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword, confirmPassword, email }),
      ...(agent ? { dispatcher: agent } : {}),
    });

    

    const text = await res.text();

    if (!res.ok) {
      console.error(`❌ [ResetPassword][${ts()}][cid=${corrId}] Backend hatası:\n${text}`);
      return NextResponse.json(
        { ok: false, error: "backend_error", details: text, corrId },
        { status: res.status }
      );
    }

    

    return NextResponse.json({ ok: true, data: text, corrId }, { status: 200 });
  } catch (err) {
    
    return NextResponse.json({ ok: false, error: "proxy_error", corrId }, { status: 500 });
  } finally {
    console.log(`🏁 [ResetPassword][${ts()}][cid=${corrId}] İşlem tamamlandı.\n`);
  }
}
