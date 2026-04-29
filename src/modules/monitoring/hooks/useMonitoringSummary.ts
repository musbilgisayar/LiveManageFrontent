// src/modules/monitoring/hooks/useMonitoringSummary.ts

"use client";

import useSWR from "swr";
import { getMonitoringSummary } from "../services/monitoringSummary.service";
import type { MonitoringSummaryDto } from "../types/MonitoringSummary.types";

const MONITORING_SUMMARY_SWR_KEY = "/admin/monitoring/summary";

type UseMonitoringSummaryResult = {
  summary: MonitoringSummaryDto | null;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMonitoringSummary(): UseMonitoringSummaryResult {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<MonitoringSummaryDto>(
      MONITORING_SUMMARY_SWR_KEY,
      getMonitoringSummary,
      {
        revalidateOnFocus: false,
        dedupingInterval: 10_000,
      }
    );

  return {
    summary: data ?? null,
    isLoading,
    isValidating,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refresh: async () => {
      await mutate();
    },
  };
}