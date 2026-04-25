import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          ok: false,
          message: "Body is required.",
          userMessage: "Kaydedilecek sosyal medya verisi eksik.",
        },
        { status: 400 }
      );
    }

    return proxyJsonWithWebAuth(req, {
      url: "/api/v1.0/profile/social-media",
      method: "POST",
      body,
      logLabel: "SocialMedia.Create",
    });
  } catch (error) {
    console.error("[BFF][SocialMedia.Create][EX]", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Sosyal medya create isteği sırasında hata oluştu.",
      },
      { status: 500 }
    );
  }
}