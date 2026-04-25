import { NextRequest } from "next/server";
import globalFetcher from "@/app/api/_shared/globalFetcher.server";

const BACKEND_BASE =
  process.env.BACKEND_URL ?? "https://localhost:5002";

/**
 * 🧩 Profile Addresses BFF Proxy
 * Frontend → /api/v1.0/{lang}/profile/addresses
 * Backend  → /api/v1.0/profile/addresses
 */

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ lang: string }> }
) {
  const { lang } = await context.params;
  const backendUrl = `${BACKEND_BASE}/api/v1.0/profile/addresses`;
  console.log(`🌍 [${lang}] GET → ${backendUrl}`);
  return globalFetcher(req, backendUrl);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ lang: string }> }
) {
  const { lang } = await context.params;
  const backendUrl = `${BACKEND_BASE}/api/v1.0/profile/addresses`;
  console.log(`🌍 [${lang}] POST → ${backendUrl}`);
  return globalFetcher(req, backendUrl);
}
