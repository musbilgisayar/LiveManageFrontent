"use client";

import { useCallback, useEffect, useState } from "react";
import type { MuhasebeSetupStatusDto } from "../types/MuhasebeSetup.types";
import { muhasebeSetupService } from "../services/muhasebeSetup.service";
import { getMuhasebeMockSetupStatus } from "../utils/muhasebeMockSetupStorage";

type UseMuhasebeSetupStatusResult = {
  data: MuhasebeSetupStatusDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMuhasebeSetupStatus(
  propertyId?: string | null
): UseMuhasebeSetupStatusResult {
  const [data, setData] = useState<MuhasebeSetupStatusDto | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(propertyId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertyId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await muhasebeSetupService.getStatus(propertyId);
      setData(result);
    } catch (err) {
      console.error("[useMuhasebeSetupStatus] Kurulum durumu alınamadı:", err);

      setError("Muhasebe kurulum durumu alınamadı.");

      // Backend hazır değilken ekran akışı bozulmasın diye mock fallback.
 
setData(getMuhasebeMockSetupStatus());

    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh: load,
  };
}