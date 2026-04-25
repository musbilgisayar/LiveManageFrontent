import { NextRequest } from "next/server";
import globalFetcher from "@/app/api/_shared/globalFetcher.server";

const BACKEND_BASE = process.env.BACKEND_URL ?? "https://localhost:5002";

/**
 * 🔹 DELETE → Tek rol sil
 * 
 */
export async function DELETE(req: NextRequest, { params }: { params: { lang: string; id: string } }) {
  const backendUrl = `${BACKEND_BASE}/api/v1.0/AppRole/${params.id}`;
  console.log(`🗑️ [${params.lang}] DELETE → ${backendUrl}`);
  return globalFetcher(req, backendUrl);
}
