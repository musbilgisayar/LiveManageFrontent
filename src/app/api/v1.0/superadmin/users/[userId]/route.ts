import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const API_BASE_URL =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "BACKEND_BASE tanımlı değil.",
        },
        { status: 500 }
      );
    }

    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "UserId zorunludur.",
        },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const parsedBody = rawBody ? JSON.parse(rawBody) : null;

    if (!parsedBody) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body zorunludur.",
        },
        { status: 400 }
      );
    }

    const targetUrl = `${API_BASE_URL}/api/v1.0/identity/AppUser/${encodeURIComponent(userId)}`;

    return proxyJsonWithWebAuth(req, {
      url: targetUrl,
      method: "PATCH",
      body: parsedBody,
      logLabel: "SuperAdmin.Users.PATCH",
    });
  } catch (error) {
    console.error("[BFF][SuperAdmin.Users.PATCH][EX]", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "SuperAdmin kullanıcı güncelleme işlemi başarısız oldu.",
      },
      { status: 500 }
    );
  }
}