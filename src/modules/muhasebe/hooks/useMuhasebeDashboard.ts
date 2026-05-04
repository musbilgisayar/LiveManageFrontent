"use client";

import { useCallback, useEffect, useState } from "react";
import type { MuhasebeDashboardSummaryDto } from "../types/MuhasebeDashboard.types";
import { muhasebeDashboardService } from "../services/muhasebeDashboard.service";

type UseMuhasebeDashboardResult = {
  data: MuhasebeDashboardSummaryDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMuhasebeDashboard(
  propertyId?: string | null
): UseMuhasebeDashboardResult {
  const [data, setData] = useState<MuhasebeDashboardSummaryDto | null>(null);
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

      const result = await muhasebeDashboardService.getSummary(propertyId);
      setData(result);
    } catch (err) {
      console.error("[useMuhasebeDashboard] Veri alınamadı:", err);
      setError("Muhasebe dashboard verisi alınamadı.");
      setData(null);
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