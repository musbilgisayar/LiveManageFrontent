"use client";

import { useCallback, useEffect, useState } from "react";

import { getRoleDistribution } from "../services/roleManager.service";

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
  const [items, setItems] = useState<RoleDistributionDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

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
        error instanceof Error
          ? error.message
          : "Rol dağılımı alınamadı.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [scope.mode, scope.tenantId]);

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