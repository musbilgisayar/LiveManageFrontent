import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const API_BASE_URL =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

type Props = {
  params: Promise<{ userId: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
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

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "UserId zorunludur.",
        },
        { status: 400 }
      );
    }

    const targetUrl = `${API_BASE_URL}/api/v1.0/identity/AppUser/${encodeURIComponent(userId)}/detail`;

    return proxyJsonWithWebAuth(req, {
      url: targetUrl,
      method: "GET",
      logLabel: "SuperAdmin.Users.Detail.GET",
    });
  } catch (error) {
    console.error("[BFF][SuperAdmin.Users.Detail.GET][EX]", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "SuperAdmin kullanıcı detayı alınamadı.",
      },
      { status: 500 }
    );
  }
}