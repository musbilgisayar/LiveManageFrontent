import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const BACKEND_BASE_ULTIMATE =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

const LOG_PREFIX = "UserPhoneNumbersUltimate";

function buildListUrlUltimate(userId: string) {
  return new URL(
    `/api/v1.0/identity/AppUser/${encodeURIComponent(userId)}/phone-numbers`,
    BACKEND_BASE_ULTIMATE
  ).toString();
}

function buildCreateUrlUltimate() {
  return new URL(
    "/api/v1.0/identity/AppUser/phone-numbers",
    BACKEND_BASE_ULTIMATE
  ).toString();
}

function buildValidationError(message: string, userMessage: string, field: string) {
  return NextResponse.json(
    {
      ok: false,
      message,
      userMessage,
      data: null,
      errors: {
        [field]: [message],
      },
    },
    { status: 400 }
  );
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return buildValidationError(
        "userId is required.",
        "Kullanıcı bilgisi eksik.",
        "userId"
      );
    }

    const backendUrl = buildListUrlUltimate(userId);

    return await proxyJsonWithWebAuth(req, {
      url: backendUrl,
      method: "GET",
      logLabel: `${LOG_PREFIX}.GET`,
    });
  } catch (error) {
    console.error(`[BFF][${LOG_PREFIX}][GET][EX]`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        message: "BFF user phone numbers GET request failed.",
        userMessage: "Telefon numaraları alınamadı.",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const parsedBody = rawBody ? JSON.parse(rawBody) : null;
    const userId = parsedBody?.userId;

    if (!userId) {
      return buildValidationError(
        "userId is required.",
        "Kullanıcı bilgisi eksik.",
        "userId"
      );
    }

    const backendUrl = buildCreateUrlUltimate();

    return await proxyJsonWithWebAuth(req, {
      url: backendUrl,
      method: "POST",
      body: parsedBody,
      logLabel: `${LOG_PREFIX}.POST`,
    });
  } catch (error) {
    console.error(`[BFF][${LOG_PREFIX}][POST][EX]`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        message: "BFF user phone numbers POST request failed.",
        userMessage: "Telefon ekleme işlemi tamamlanamadı.",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}