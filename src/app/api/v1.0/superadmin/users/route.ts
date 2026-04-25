import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const API_BASE_URL =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

export async function GET(req: NextRequest) {
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

    const url = new URL(req.url);
    const search = url.searchParams.toString();

    const targetUrl = `${API_BASE_URL}/api/v1.0/identity/AppUser${
      search ? `?${search}` : ""
    }`;

    return proxyJsonWithWebAuth(req, {
      url: targetUrl,
      method: "GET",
      logLabel: "SuperAdmin.Users.GET",
    });
  } catch (error) {
    console.error("[BFF][SuperAdmin.Users.GET][EX]", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "SuperAdmin kullanıcı listesi alınamadı.",
      },
      { status: 500 }
    );
  }
}