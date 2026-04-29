// src/modules/monitoring/services/monitoringSummary.service.ts

"use client";

import { getWebFetcher } from "@/utils/fetchers.web.client";
import type { MonitoringSummaryDto } from "../types/MonitoringSummary.types";

type GenericResponseDto<T> = {
  ok?: boolean;
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data: T | null;
  errors?: string[] | null;
};

const MONITORING_SUMMARY_URL = "/api/v1.0/admin/monitoring/summary";

export async function getMonitoringSummary(): Promise<MonitoringSummaryDto> {
  const response = (await getWebFetcher(
    MONITORING_SUMMARY_URL
  )) as GenericResponseDto<MonitoringSummaryDto>;

  const isSuccess = response?.ok === true || response?.success === true;

  if (!isSuccess || !response.data) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "Monitoring summary alınamadı."
    );
  }

  return response.data;
}