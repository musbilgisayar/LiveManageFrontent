//src/lib/bff/header.ts

/// 🌐 BFF Proxy Headers Builder
import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { resolveTenant } from "./resolveTenant";

export function buildBffHeaders(req: NextRequest) {
  const tenant = resolveTenant(req);

  return {
    "Content-Type": "application/json",
    "x-tenant-key": tenant,
    "x-correlation-id":
      req.headers.get("x-correlation-id") || crypto.randomUUID(),
    "accept-language":
      req.headers.get("accept-language") || "tr-TR",
  };
}