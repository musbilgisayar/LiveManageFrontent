// src/modules/monitoring/hooks/useLockoutMonitoring.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getLockoutDetail,
  getLockoutRecentActivity,
  getLockoutSummary,
  searchLockouts,
} from "../services/lockoutMonitoring.service";

import type {
  LockoutActivityItemDto,
  LockoutCenterSummaryDto,
  LockoutDetailDto,
  LockoutListItemDto,
  LockoutListResultDto,
  LockoutRisk,
  LockoutSearchRequestDto,
  LockoutStatus,
  LockoutTargetType,
} from "../types/LockoutMonitoring.types";

export type LockoutFilterState = {
  search: string;
  type: "all" | LockoutTargetType;
  status: "all" | LockoutStatus;
  risk: "all" | LockoutRisk;
};

type UseLockoutMonitoringOptions = {
  enabled?: boolean;
  pageSize?: number;
  recentActivityTake?: number;
};

type UseLockoutMonitoringResult = {
  summary: LockoutCenterSummaryDto | null;
  listResult: LockoutListResultDto | null;
  items: LockoutListItemDto[];
  selectedItem: LockoutDetailDto | LockoutListItemDto | null;
  selectedDetail: LockoutDetailDto | null;
  recentActivity: LockoutActivityItemDto[];

  filters: LockoutFilterState;
  selectedId: string;

  isLoading: boolean;
  isSummaryLoading: boolean;
  isListLoading: boolean;
  isDetailLoading: boolean;
  isActivityLoading: boolean;
  isRefreshing: boolean;

  error: string | null;

  setFilters: React.Dispatch<React.SetStateAction<LockoutFilterState>>;
  setSelectedId: (id: string) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
};

const DEFAULT_FILTERS: LockoutFilterState = {
  search: "",
  type: "all",
  status: "all",
  risk: "all",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Lockout monitoring data could not be loaded.";
}

export function useLockoutMonitoring(
  options: UseLockoutMonitoringOptions = {}
): UseLockoutMonitoringResult {
  const { enabled = true, pageSize = 20, recentActivityTake = 20 } = options;

  const [summary, setSummary] = useState<LockoutCenterSummaryDto | null>(null);
  const [listResult, setListResult] = useState<LockoutListResultDto | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<LockoutDetailDto | null>(null);
  const [recentActivity, setRecentActivity] = useState<LockoutActivityItemDto[]>([]);

  const [filters, setFilters] = useState<LockoutFilterState>(DEFAULT_FILTERS);
  const [selectedId, setSelectedIdState] = useState<string>("");

  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const items = listResult?.items ?? [];

  const searchRequest = useMemo<LockoutSearchRequestDto>(() => {
    return {
      search: filters.search.trim() || undefined,
      type: filters.type,
      status: filters.status,
      risk: filters.risk,
      includeReleased: true,
      page: 1,
      pageSize,
    };
  }, [filters, pageSize]);

  const selectedItem = useMemo(() => {
    if (selectedDetail) return selectedDetail;

    if (!selectedId) return items[0] ?? null;

    return items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  }, [items, selectedDetail, selectedId]);

  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);

    try {
      const data = await getLockoutSummary();
      setSummary(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const loadList = useCallback(async (): Promise<string> => {
    setIsListLoading(true);

    try {
      const data = await searchLockouts(searchRequest);
      setListResult(data);

      const firstId = data.items[0]?.id ?? "";
      let nextSelectedId = firstId;

      setSelectedIdState((current) => {
        if (!current) {
          nextSelectedId = firstId;
          return firstId;
        }

        const exists = data.items.some((item) => item.id === current);
        nextSelectedId = exists ? current : firstId;
        return nextSelectedId;
      });

      return nextSelectedId;
    } catch (err) {
      setError(getErrorMessage(err));
      setListResult(null);
      return "";
    } finally {
      setIsListLoading(false);
    }
  }, [searchRequest]);

  const loadRecentActivity = useCallback(async () => {
    setIsActivityLoading(true);

    try {
      const data = await getLockoutRecentActivity(recentActivityTake);
      setRecentActivity(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsActivityLoading(false);
    }
  }, [recentActivityTake]);

  const loadDetail = useCallback(async (id: string) => {
    if (!id) {
      setSelectedDetail(null);
      return;
    }

    setIsDetailLoading(true);

    try {
      const data = await getLockoutDetail(id);
      setSelectedDetail(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSelectedDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const [, nextSelectedId] = await Promise.all([
        Promise.all([loadSummary(), loadRecentActivity()]),
        loadList(),
      ]);

      if (nextSelectedId) {
        await loadDetail(nextSelectedId);
      } else {
        setSelectedDetail(null);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled, loadSummary, loadRecentActivity, loadList, loadDetail]);

  const setSelectedId = useCallback((id: string) => {
    setSelectedDetail(null);
    setSelectedIdState(id);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedDetail(null);
    setSelectedIdState("");
    setFilters(DEFAULT_FILTERS);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    void refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) return;
    if (!selectedId) {
      setSelectedDetail(null);
      return;
    }

    void loadDetail(selectedId);
  }, [enabled, selectedId, loadDetail]);

  return {
    summary,
    listResult,
    items,
    selectedItem,
    selectedDetail,
    recentActivity,

    filters,
    selectedId,

    isLoading: isSummaryLoading || isListLoading || isDetailLoading || isActivityLoading,
    isSummaryLoading,
    isListLoading,
    isDetailLoading,
    isActivityLoading,
    isRefreshing,

    error,

    setFilters,
    setSelectedId,
    clearFilters,
    refresh,
  };
}