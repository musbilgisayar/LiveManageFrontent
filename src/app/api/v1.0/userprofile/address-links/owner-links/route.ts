import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  process.env.BACKEND_BASE ??
  process.env.BACKEND_URL ??
  "https://localhost:5002";

function buildUrl(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  const ownerKind = req.nextUrl.searchParams.get("ownerKind");

  const url = new URL("/api/v1.0/profile/address-links/owner-links", BACKEND_BASE);

  if (ownerId) url.searchParams.set("ownerId", ownerId);
  if (ownerKind) url.searchParams.set("ownerKind", ownerKind);

  return url.toString();
}

function copyAuthHeaders(req: NextRequest) {
  const headers = new Headers();
  headers.set("accept", "application/json");

  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const acceptLanguage = req.headers.get("accept-language");
  if (acceptLanguage) headers.set("accept-language", acceptLanguage);

  const tenant =
    req.headers.get("x-tenant-key") ??
    req.cookies.get("lm.tenant")?.value ??
    req.cookies.get("tenantKey")?.value;

  if (tenant) headers.set("x-tenant-key", tenant);

  const correlationId = req.headers.get("x-correlation-id");
  if (correlationId) headers.set("x-correlation-id", correlationId);

  return headers;
}

export async function GET(req: NextRequest) {
  try {
    const backendUrl = buildUrl(req);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: copyAuthHeaders(req),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = await response.json();
      return NextResponse.json(json, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": contentType || "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "BFF owner-links request failed.",
        userMessage: "Adres bağlantıları alınamadı.",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}