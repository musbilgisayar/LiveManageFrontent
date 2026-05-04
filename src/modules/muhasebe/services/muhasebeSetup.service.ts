import type { MuhasebeSetupStatusDto } from "../types/MuhasebeSetup.types";

const BASE_PATH = "/api/v1.0/property-accounting/setup";

export const muhasebeSetupService = {
  async getStatus(propertyId: string): Promise<MuhasebeSetupStatusDto> {
    const res = await fetch(`${BASE_PATH}/status?propertyId=${propertyId}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Muhasebe kurulum durumu alınamadı.");
    }

    const json = await res.json();

    return json?.data ?? json;
  },
};