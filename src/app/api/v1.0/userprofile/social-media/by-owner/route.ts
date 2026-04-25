import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const BACKEND_BASE =
  process.env.BACKEND_BASE ??
  process.env.BACKEND ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

function buildBackendUrl() {
  return new URL("/api/v1.0/profile/social-media/by-owner", BACKEND_BASE).toString();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const ownerType = searchParams.get("ownerType");
    const ownerId = searchParams.get("ownerId");

    if (!ownerType || !ownerId) {
      return NextResponse.json(
        {
          success: false,
          message: "ownerType ve ownerId zorunludur.",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    const backendUrl = buildBackendUrl();

    return proxyJsonWithWebAuth(req, {
      url: backendUrl,
      method: "POST",
      body: {
        ownerType,
        ownerId,
      },
      logLabel: "SocialMediaByOwner.GET",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Sosyal medya by-owner isteği sırasında hata oluştu.",
        code: "BFF_ERROR",
        detail: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}