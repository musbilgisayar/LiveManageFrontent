"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getGlobalManagementApplications,
  getMyManagementApplications,
} from "../services/managementApplication.service";

import type { ManagedPropertyApplicationListItemDto } from "../types/managementApplication.types";

type DashboardMode = "my" | "global";

type DashboardSummary = {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  cancelled: number;
  documentRequested: number;
};

type UseManagementApplicationsDashboardOptions = {
  mode?: DashboardMode;
};

function normalizeStatus(status: unknown): string {
  return String(status ?? "").toLowerCase();
}

function getApplicationDateValue(
  item: ManagedPropertyApplicationListItemDto,
): number {
  const record = item as unknown as Record<string, unknown>;

  const rawDate =
    record.submittedAtUtc ??
    record.submittedAt ??
    record.createdAt ??
    record.createdAtUtc ??
    record.appliedAt ??
    record.applicationDate ??
    record.updatedAt;

  if (!rawDate) return 0;

  const value = new Date(String(rawDate)).getTime();

  return Number.isNaN(value) ? 0 : value;
}

function isStatus(status: string, value: number, words: string[]) {
  return status === String(value) || words.some((word) => status.includes(word));
}

export default function useManagementApplicationsDashboard(
  options: UseManagementApplicationsDashboardOptions = {},
) {
  const mode = options.mode ?? "my";

  const [items, setItems] = useState<ManagedPropertyApplicationListItemDto[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        mode === "global"
          ? await getGlobalManagementApplications()
          : await getMyManagementApplications();

      if (!response.ok) {
        setItems([]);

        setErrorMessage(
          response.userMessage ||
            response.message ||
            "Başvurular yüklenemedi.",
        );

        return;
      }

      setItems(Array.isArray(response.data) ? response.data : []);
    } catch {
      setItems([]);
      setErrorMessage("Başvurular yüklenirken beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo<DashboardSummary>(() => {
    return items.reduce(
      (acc, item) => {
        const status = normalizeStatus(item.status);

        acc.total += 1;

        if (isStatus(status, 0, ["pending"])) acc.pending += 1;

        if (
          isStatus(status, 1, ["underreview", "under_review", "review"]) ||
          isStatus(status, 2, ["inreview", "in_review"])
        ) {
          acc.inReview += 1;
        }

        if (isStatus(status, 3, ["approved"])) acc.approved += 1;

        if (isStatus(status, 4, ["rejected"])) acc.rejected += 1;

        if (isStatus(status, 5, ["cancelled", "canceled"])) acc.cancelled += 1;

        if (isStatus(status, 6, ["document", "requested"])) {
          acc.documentRequested += 1;
        }

        return acc;
      },
      {
        total: 0,
        pending: 0,
        inReview: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        documentRequested: 0,
      },
    );
  }, [items]);

  const recentApplications = useMemo(() => {
    return [...items]
      .sort((a, b) => getApplicationDateValue(b) - getApplicationDateValue(a))
      .slice(0, 5);
  }, [items]);

  return {
    items,
    summary,
    recentApplications,
    isLoading,
    errorMessage,
    refresh: load,
  };
}