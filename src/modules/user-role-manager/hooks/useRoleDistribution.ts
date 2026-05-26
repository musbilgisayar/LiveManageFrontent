"use client";

import { useCallback, useEffect, useState } from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import { getRoleDistribution } from "../services/roleManager.service";

import { resolveRoleManagerErrorMessage }
  from "../utils/resolveRoleManagerErrorMessage";

import type {
  RoleDistributionDto,
  RoleManagerScopeState,
} from "../types/RoleManager.types";

type UseRoleDistributionReturn = {
  items: RoleDistributionDto[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
};

export default function useRoleDistribution(
  scope: RoleManagerScopeState,
): UseRoleDistributionReturn {
  const { t } = useI18nNs("userRoleManager");

  const [items, setItems] = useState<RoleDistributionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getRoleDistribution({
        tenantId: scope.tenantId,
        allTenants: scope.mode === "allTenants",
      });

      setItems(data);
    } catch (error) {
      setItems([]);
      setErrorMessage(
        resolveRoleManagerErrorMessage(
          error,
          "errors.distributionLoadFailed",
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
    items,
    isLoading,
    errorMessage,
    reload: load,
  };
}
