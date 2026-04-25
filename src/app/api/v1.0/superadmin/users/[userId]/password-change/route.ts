export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const BACKEND =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  process.env.BACKEND_BASE_URL ??
  "https://localhost:5002";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "1.0";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Kullanıcı kimliği zorunludur.",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          ok: false,
          message: "Geçersiz istek gövdesi.",
        },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND}/api/v${API_VERSION}/identity/AppUser/${encodeURIComponent(userId)}/set-password`;

    return proxyJsonWithWebAuth(req, {
      url: backendUrl,
      method: "POST",
      body: {
        newPassword: (body as any).newPassword,
        reason:
          (body as any).reason ??
          "SuperAdmin paneli üzerinden parola güncellendi",
        logoutAllSessions: (body as any).logoutAllSessions ?? true,
      },
      logLabel: "SuperAdmin.Users.PasswordChange.POST",
    });
  } catch (error) {
    console.error("[BFF][SuperAdmin.Users.PasswordChange.POST][EX]", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        message:
          "Şifre değiştirme isteği işlenirken beklenmeyen bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}