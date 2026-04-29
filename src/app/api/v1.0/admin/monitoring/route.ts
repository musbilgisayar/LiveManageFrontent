// src/app/api/v1.0/admin/monitoring/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "monitoring.root.loaded",
      userMessage: "Monitoring API aktif.",
      data: {
        module: "monitoring",
        endpoints: {
          lockoutSummary: "/api/v1.0/admin/monitoring/lockouts/summary",
          lockoutList: "/api/v1.0/admin/monitoring/lockouts",
          lockoutRecentActivity:
            "/api/v1.0/admin/monitoring/lockouts/recent-activity",
        },
      },
    },
    { status: 200 }
  );
}