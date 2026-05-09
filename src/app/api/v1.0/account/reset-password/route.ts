// src/app/api/v1.0/account/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Agent } from "undici";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const BACKEND_BASE =
  process.env.BACKEND_BASE ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://localhost:5002";

const UPSTREAM_PATH = "/api/v1.0/Account/reset-password";

const insecureDispatcher =
  process.env.BE_SSL_INSECURE === "true"
    ? new Agent({
        connect: {
          rejectUnauthorized: false,
        },
      })
    : undefined;

export async function POST(req: NextRequest) {
  const corrId = req.headers.get("x-correlation-id") ?? randomUUID();
  const ts = () => new Date().toISOString();

  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      console.warn(
        `⚠️ [ResetPassword][${ts()}][cid=${corrId}] JSON parse edilemedi veya boş body geldi.`
      );

      return NextResponse.json(
        {
          ok: false,
          error: "invalid_json",
          corrId,
        },
        {
          status: 400,
          headers: {
            "x-correlation-id": corrId,
          },
        }
      );
    }

    const { token, newPassword, confirmPassword, email } = body;

    console.info(`📦 [ResetPassword][${ts()}][cid=${corrId}] Gelen parametreler:`, {
      email,
      hasToken: !!token,
      hasNewPassword: !!newPassword,
      hasConfirm: !!confirmPassword,
    });

    if (!token || !newPassword || !confirmPassword || !email) {
      console.warn(
        `⚠️ [ResetPassword][${ts()}][cid=${corrId}] Eksik alan(lar) bulundu.`
      );

      return NextResponse.json(
        {
          ok: false,
          error: "missing_fields",
          corrId,
        },
        {
          status: 400,
          headers: {
            "x-correlation-id": corrId,
          },
        }
      );
    }

    const targetUrl = `${BACKEND_BASE}${UPSTREAM_PATH}`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "accept-language": req.headers.get("accept-language") ?? "tr-TR",
        "x-tenant-key": req.headers.get("x-tenant-key") ?? "default",
        "x-correlation-id": corrId,
      },
      body: JSON.stringify({
        token,
        newPassword,
        confirmPassword,
        email,
      }),
      cache: "no-store",
      ...(insecureDispatcher ? { dispatcher: insecureDispatcher } : {}),
    } as RequestInit);

    const text = await res.text();
    const payload = text
      ? JSON.parse(text)
      : {
          ok: res.ok,
        };

    if (!res.ok) {
      console.error(
        `❌ [ResetPassword][${ts()}][cid=${corrId}] Backend hatası:`,
        payload
      );
    }

    return NextResponse.json(payload, {
      status: res.status,
      headers: {
        "x-correlation-id": corrId,
      },
    });
  } catch (err: any) {
    console.error(`❌ [ResetPassword][${ts()}][cid=${corrId}] Proxy hatası:`, {
      message: err?.message,
      cause: err?.cause,
      backendBase: BACKEND_BASE,
      path: UPSTREAM_PATH,
    });

    return NextResponse.json(
      {
        ok: false,
        error: "proxy_error",
        detail: err?.message ?? String(err),
        corrId,
      },
      {
        status: 500,
        headers: {
          "x-correlation-id": corrId,
        },
      }
    );
  } finally {
    console.log(`🏁 [ResetPassword][${ts()}][cid=${corrId}] İşlem tamamlandı.`);
  }
}