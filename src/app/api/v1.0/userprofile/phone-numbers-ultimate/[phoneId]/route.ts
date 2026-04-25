import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const BACKEND_BASE_ULTIMATE =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

const LOG_PREFIX = "UserPhoneNumbersUltimate";

function buildUpdateUrlUltimate() {
  return new URL(
    "/api/v1.0/identity/AppUser/phone-numbers",
    BACKEND_BASE_ULTIMATE
  ).toString();
}

function buildDeleteUrlUltimate(phoneId: string) {
  return new URL(
    `/api/v1.0/identity/AppUser/phone-numbers/${encodeURIComponent(phoneId)}`,
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ phoneId: string }> }
) {
  try {
    const { phoneId } = await context.params;
    const rawBody = await req.text();
    const parsedBody = rawBody ? JSON.parse(rawBody) : null;

    if (!parsedBody) {
      return buildValidationError(
        "Request body is required.",
        "Güncellenecek telefon bilgisi eksik.",
        "body"
      );
    }

    if (!parsedBody.phoneId) {
      parsedBody.phoneId = phoneId;
    }

    if (!parsedBody.phoneId) {
      return buildValidationError(
        "phoneId is required.",
        "Telefon bilgisi eksik.",
        "phoneId"
      );
    }

    const backendUrl = buildUpdateUrlUltimate();

    return await proxyJsonWithWebAuth(req, {
      url: backendUrl,
      method: "PUT",
      body: parsedBody,
      logLabel: `${LOG_PREFIX}.PUT`,
    });
  } catch (error) {
    console.error(`[BFF][${LOG_PREFIX}][PUT][EX]`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        message: "BFF user phone number PUT request failed.",
        userMessage: "Telefon güncelleme işlemi tamamlanamadı.",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ phoneId: string }> }
) {
  try {
    const { phoneId } = await context.params;

    if (!phoneId) {
      return buildValidationError(
        "phoneId is required.",
        "Telefon bilgisi eksik.",
        "phoneId"
      );
    }

    const backendUrl = buildDeleteUrlUltimate(phoneId);

    return await proxyJsonWithWebAuth(req, {
      url: backendUrl,
      method: "DELETE",
      logLabel: `${LOG_PREFIX}.DELETE`,
    });
  } catch (error) {
    console.error(`[BFF][${LOG_PREFIX}][DELETE][EX]`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        message: "BFF user phone number DELETE request failed.",
        userMessage: "Telefon silme işlemi tamamlanamadı.",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}