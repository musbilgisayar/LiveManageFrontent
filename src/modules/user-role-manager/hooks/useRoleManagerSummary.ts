"use client";

import { useCallback, useEffect, useState } from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import { getRoleManagerSummary } from "../services/roleManager.service";

import { resolveRoleManagerErrorMessage }
  from "../utils/resolveRoleManagerErrorMessage";

import type {
  RoleManagerScopeState,
  RoleManagerSummaryDto,
} from "../types/RoleManager.types";

type UseRoleManagerSummaryReturn = {
  summary: RoleManagerSummaryDto | null;
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
};

export default function useRoleManagerSummary(
  scope: RoleManagerScopeState,
): UseRoleManagerSummaryReturn {
  const { t } = useI18nNs("userRoleManager");

  const [summary, setSummary] = useState<RoleManagerSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getRoleManagerSummary({
        tenantId: scope.tenantId,
        allTenants: scope.mode === "allTenants",
      });

      setSummary(data);
    } catch (error) {
      setSummary(null);
      setErrorMessage(
        resolveRoleManagerErrorMessage(
          error,
          "errors.summaryLoadFailed",
          t,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [scope.mode, scope.tenantId, t]);

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
