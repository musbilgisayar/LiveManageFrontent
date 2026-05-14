import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const API_BASE_URL =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() ?? "";

    const params = new URLSearchParams();

    params.set("Page", "1");
    params.set("PageSize", "20");

    if (q) {
      params.set("Search", q);
    }

    const targetUrl = `${API_BASE_URL}/api/v1.0/identity/AppUser?${params.toString()}`;

    return proxyJsonWithWebAuth(req, {
      url: targetUrl,
      method: "GET",
      logLabel: "Permission.UserLookup.Search",
    });
  } catch (error) {
    console.error("[BFF][Permission.UserLookup.Search][EX]", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Kullanıcı arama işlemi başarısız.",
      },
      { status: 500 }
    );
  }
}