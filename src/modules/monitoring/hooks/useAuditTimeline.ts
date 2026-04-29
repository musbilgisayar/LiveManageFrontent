import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getAuditTimelineDetail,
  getAuditTimelineFilterOptions,
  getAuditTimelineList,
  getAuditTimelineRecent,
  getAuditTimelineSummary,
} from "../services/auditTimeline.service";

import type {
  AuditTimelineActivityDto,
  AuditTimelineDetailDto,
  AuditTimelineFilterOptionsDto,
  AuditTimelineItem,
  AuditTimelineItemDto,
  AuditTimelineListResult,
  AuditTimelineQueryDto,
  AuditTimelineSummaryDto,
} from "../types/AuditTimeline.types";

function normalizeText(value?: string | null, fallback = ""): string {
  return value && value.trim().length > 0 ? value : fallback;
}

function mapAuditTimelineItem(dto: AuditTimelineItemDto): AuditTimelineItem {
  return {
    id: dto.id,
    type: normalizeText(dto.eventType, "unknown"),
    source: normalizeText(dto.source, "unknown"),
    titleKey: dto.titleKey,
    title: dto.titleKey,
    description: dto.description ?? dto.descriptionKey ?? undefined,
    at: dto.occurredAtUtc,
    targetType: normalizeText(dto.targetType, "unknown"),
    targetValueMasked: normalizeText(dto.targetValueMasked, "-"),
    riskLevel: dto.riskLevel ?? null,
    status: dto.status ?? null,
    actorDisplayName: dto.actorDisplayName ?? null,
    actorUserId: dto.actorUserId ?? null,
    ipAddressMasked: dto.ipAddressMasked ?? null,
    deviceInfoMasked: dto.deviceInfoMasked ?? null,
    locationSummary: dto.locationSummary ?? null,
    correlationId: dto.correlationId ?? null,
    raw: dto,
  };
}

function mapAuditTimelineList(
  dto: {
    items: AuditTimelineItemDto[];
    totalCount: number;
    page: number;
    pageSize: number;
  }
): AuditTimelineListResult {
  return {
    items: dto.items.map(mapAuditTimelineItem),
    totalCount: dto.totalCount,
    page: dto.page,
    pageSize: dto.pageSize,
  };
}

type UseAuditTimelineState = {
  summary: AuditTimelineSummaryDto | null;
  items: AuditTimelineItem[];
  selectedDetail: AuditTimelineDetailDto | null;
  recent: AuditTimelineActivityDto[];
  filterOptions: AuditTimelineFilterOptionsDto | null;

  totalCount: number;
  page: number;
  pageSize: number;

  loading: boolean;
  detailLoading: boolean;
  error: string | null;
};

const initialState: UseAuditTimelineState = {
  summary: null,
  items: [],
  selectedDetail: null,
  recent: [],
  filterOptions: null,

  totalCount: 0,
  page: 1,
  pageSize: 20,

  loading: false,
  detailLoading: false,
  error: null,
};

export function useAuditTimeline(initialQuery?: AuditTimelineQueryDto) {
  const [query, setQuery] = useState<AuditTimelineQueryDto>({
    page: 1,
    pageSize: 20,
    ...(initialQuery ?? {}),
  });

  const [state, setState] = useState<UseAuditTimelineState>(initialState);

  const load = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const [summary, list, recent, filterOptions] = await Promise.all([
        getAuditTimelineSummary(),
        getAuditTimelineList(query),
        getAuditTimelineRecent(),
        getAuditTimelineFilterOptions(),
      ]);

      const mappedList = mapAuditTimelineList(list);

      setState((prev) => ({
        ...prev,
        summary,
        items: mappedList.items,
        recent,
        filterOptions,
        totalCount: mappedList.totalCount,
        page: mappedList.page,
        pageSize: mappedList.pageSize,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Audit timeline verileri yüklenemedi.",
      }));
    }
  }, [query]);

  const loadDetail = useCallback(async (id: string) => {
    setState((prev) => ({
      ...prev,
      detailLoading: true,
      error: null,
    }));

    try {
      const detail = await getAuditTimelineDetail(id);

      setState((prev) => ({
        ...prev,
        selectedDetail: detail,
        detailLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        detailLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Audit timeline detayı yüklenemedi.",
      }));
    }
  }, []);

  const clearSelectedDetail = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedDetail: null,
    }));
  }, []);

  const updateQuery = useCallback((patch: Partial<AuditTimelineQueryDto>) => {
    setQuery((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ?? 1,
    }));
  }, []);

  const resetQuery = useCallback(() => {
    setQuery({
      page: 1,
      pageSize: initialQuery?.pageSize ?? 20,
    });
  }, [initialQuery?.pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({
      query,
      setQuery,
      updateQuery,
      resetQuery,
      refresh: load,

      summary: state.summary,
      items: state.items,
      selectedDetail: state.selectedDetail,
      recent: state.recent,
      filterOptions: state.filterOptions,

      totalCount: state.totalCount,
      page: state.page,
      pageSize: state.pageSize,

      loading: state.loading,
      detailLoading: state.detailLoading,
      error: state.error,

      loadDetail,
      clearSelectedDetail,
    }),
    [
      query,
      updateQuery,
      resetQuery,
      load,
      state.summary,
      state.items,
      state.selectedDetail,
      state.recent,
      state.filterOptions,
      state.totalCount,
      state.page,
      state.pageSize,
      state.loading,
      state.detailLoading,
      state.error,
      loadDetail,
      clearSelectedDetail,
    ]
  );
}