import { NextRequest, NextResponse } from "next/server";
import { resolveTenant } from "@/lib/bff/resolveTenant";

type BackendErrorResponse = {
  ok: false;
  error: string;
  details?: unknown;
  data?: null;
};

const resolveBackendBaseUrl = (): string | null => {
  const value =
    process.env.BACKEND_URL ||
    process.env.BACKEND_BASE ||
    process.env.BACKEND ||
    process.env.BACKEND_BASE_URL;

  if (!value || !value.trim()) {
    return null;
  }

  return value.replace(/\/+$/, "");
};

const tryParseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const buildErrorResponse = (
  error: string,
  details: unknown,
  status = 500
) => {
  const payload: BackendErrorResponse = {
    ok: false,
    error,
    details,
    data: null,
  };

  return NextResponse.json(payload, { status });
};

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomUUID();

  try {
    const backendBaseUrl = resolveBackendBaseUrl();

    if (!backendBaseUrl) {
      console.error("❌ [Register BFF] Backend base url bulunamadı", {
        correlationId,
        envKeysTried: [
          "BACKEND_URL",
          "BACKEND_BASE",
          "BACKEND",
          "BACKEND_BASE_URL",
        ],
      });

      return buildErrorResponse(
        "BACKEND_URL_MISSING",
        "Backend bağlantı adresi tanımlı değil."
      );
    }

    const body = await req.json();
    const tenantKey = resolveTenant(req);
    const acceptLanguage = req.headers.get("accept-language") || "tr-TR";

    const backendUrl = `${backendBaseUrl}/api/v1.0/account/register`;

    console.info("➡️ [Register BFF] Backend isteği başlıyor", {
      correlationId,
      backendUrl,
      tenantKey,
      acceptLanguage,
    });

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-correlation-id": correlationId,
        "X-Tenant-Key": tenantKey,
        "Accept-Language": acceptLanguage,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const rawText = await res.text();
    const parsed = rawText ? tryParseJson(rawText) : null;

    const responsePayload =
      parsed ??
      ({
        ok: res.ok,
        error: res.ok ? null : "NON_JSON_BACKEND_RESPONSE",
        details: rawText || null,
        data: null,
      } as const);

    console.info("✅ [Register BFF] Backend cevabı alındı", {
      correlationId,
      status: res.status,
      ok: res.ok,
      tenantKey,
    });

    return NextResponse.json(responsePayload, {
      status: res.status,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.";

    console.error("❌ [Register BFF] Beklenmeyen hata", {
      correlationId,
      error: message,
      raw: err,
    });

    return buildErrorResponse("INTERNAL_ERROR", message);
  }
}