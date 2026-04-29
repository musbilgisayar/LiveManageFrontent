// src/modules/monitoring/hooks/useSecurityTimeline.ts

"use client";

import { useMemo } from "react";
import useSWR from "swr";

import { getSecurityTimeline } from "../services/securityTimeline.service";
import type {
  SecurityTimelineFilter,
  SecurityTimelineItemDto,
  SecurityTimelineResponse,
} from "../types/SecurityTimeline.types";

type UseSecurityTimelineParams = {
  pageNumber?: number;
  pageSize?: number;
  filter?: SecurityTimelineFilter;
  enabled?: boolean;
};

type UseSecurityTimelineResult = {
  items: SecurityTimelineItemDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function buildSWRKey(params: UseSecurityTimelineParams) {
  if (params.enabled === false) return null;

  return [
    "security-timeline",
    params.pageNumber ?? 1,
    params.pageSize ?? 20,
    params.filter?.from ?? "",
    params.filter?.to ?? "",
    params.filter?.search ?? "",
    params.filter?.riskLevels?.join(",") ?? "",
    params.filter?.eventTypes?.join(",") ?? "",
  ];
}

export function useSecurityTimeline(
  params: UseSecurityTimelineParams = {}
): UseSecurityTimelineResult {
  const swrKey = useMemo(() => buildSWRKey(params), [params]);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<SecurityTimelineResponse>(
      swrKey,
      () =>
        getSecurityTimeline({
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 20,
          filter: params.filter,
        }),
      {
        revalidateOnFocus: false,
        dedupingInterval: 10_000,
      }
    );

  const currentPage = data?.page ?? params.pageNumber ?? 1;
  const currentPageSize = data?.pageSize ?? params.pageSize ?? 20;
  const totalCount = data?.totalCount ?? 0;
  const totalPages =
    currentPageSize > 0 ? Math.ceil(totalCount / currentPageSize) : 0;

  return {
    items: data?.items ?? [],
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalCount,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: totalPages > currentPage,
    isLoading,
    isValidating,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refresh: async () => {
      await mutate();
    },
  };
}