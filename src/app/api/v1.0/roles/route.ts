// 📁 src/app/api/v1.0/roles/route.ts
import { NextRequest } from "next/server";
import globalFetcher from "@/app/api/_shared/globalFetcher.server";

const BACKEND_BASE = process.env.BACKEND_URL ?? "https://localhost:5002";

/**
 * 🧩 Roles BFF Proxy (AppRole Endpoint)
 * ------------------------------------------------------------
 * 🎯 Frontend → /api/v1.0/roles
 * 🎯 Backend  → /api/v1.0/AppRole
 * ------------------------------------------------------------
 * - locale URL'den gelmez; Accept-Language header ile taşınır.
 * - globalFetcher JWT, AuditLog, CorrelationId başlıklarını uygular.
 */

export async function GET(req: NextRequest) {
  const backendUrl = `${BACKEND_BASE}/api/v1.0/AppRole`;
  
  return globalFetcher(req, backendUrl);
}

export async function POST(req: NextRequest) {
  const backendUrl = `${BACKEND_BASE}/api/v1.0/AppRole`;
 
  return globalFetcher(req, backendUrl);
}

export async function PUT(req: NextRequest) {
  const backendUrl = `${BACKEND_BASE}/api/v1.0/AppRole`;
  console.log(`🌍 [roles] PUT → ${backendUrl}`);
  return globalFetcher(req, backendUrl);
}

export async function DELETE(req: NextRequest) {
  const backendUrl = `${BACKEND_BASE}/api/v1.0/AppRole`;
  console.log(`🌍 [roles] DELETE → ${backendUrl}`);
  return globalFetcher(req, backendUrl);
}