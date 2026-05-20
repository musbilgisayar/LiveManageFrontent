"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  RoleManagerScopeState,
  RoleManagerSummaryDto,
} from "../types/RoleManager.types";

import { getRoleManagerSummary }
  from "../services/roleManager.service";

type UseRoleManagerSummaryReturn = {
  summary: RoleManagerSummaryDto | null;

  isLoading: boolean;

  errorMessage: string | null;

  reload: () => Promise<void>;
};

export default function useRoleManagerSummary(
  scope: RoleManagerScopeState,
): UseRoleManagerSummaryReturn {
  const [summary, setSummary] =
    useState<RoleManagerSummaryDto | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);

      setErrorMessage(null);

      const data =
        await getRoleManagerSummary({
          tenantId: scope.tenantId,
          allTenants:
            scope.mode === "allTenants",
        });

      setSummary(data);
    } catch (error) {
      setSummary(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Rol yönetimi özeti alınamadı.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [scope.mode, scope.tenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    summary,
    isLoading,
    errorMessage,
    reload: load,
  };
}