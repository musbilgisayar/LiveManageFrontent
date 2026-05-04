import type { MuhasebeDashboardSummaryDto } from "../types/MuhasebeDashboard.types";

// ------------------------------------------------------------
// SERVICE
// ------------------------------------------------------------
export const muhasebeDashboardService = {
  async getSummary(propertyId: string): Promise<MuhasebeDashboardSummaryDto> {
    const res = await fetch(
      `/api/v1.0/property-accounting/dashboard?propertyId=${propertyId}`,
      {
        method: "GET",
        credentials: "include", // 🔥 cookie auth
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Muhasebe dashboard verisi alınamadı");
    }

    const json = await res.json();

    // senin standardın
    return json?.data ?? json;
  },
};