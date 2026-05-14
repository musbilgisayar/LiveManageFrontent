// src/modules/permissions/hooks/usePermissionCatalog.ts

"use client";

import { useEffect, useMemo, useState } from "react";

import { getPermissionCatalog } from "../services/permissionCatalog.service";
import type {
  PermissionCatalogDto,
  PermissionCatalogFilterState,
  PermissionDefinitionDto,
} from "../types/Permission.types";

const INITIAL_FILTERS: PermissionCatalogFilterState = {
  search: "",
  module: "all",
  scope: "all",
  level: "all",
  sensitive: "all",
};

export function usePermissionCatalog() {
  const [data, setData] = useState<PermissionCatalogDto | null>(null);
  const [filters, setFilters] =
    useState<PermissionCatalogFilterState>(INITIAL_FILTERS);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPermissionCatalog();

        if (!alive) return;

        setData(result);
      } catch (err) {
        if (!alive) return;

        setError(
          err instanceof Error
            ? err.message
            : "Permission catalog could not be loaded."
        );
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const permissions = useMemo<PermissionDefinitionDto[]>(() => {
    const sourcePermissions = data?.permissions ?? [];
    const search = filters.search.trim().toLowerCase();

    return sourcePermissions.filter((permission) => {
      const code = permission.code?.toLowerCase() ?? "";
      const module = permission.module?.toLowerCase() ?? "";
      const action = permission.action?.toLowerCase() ?? "";
      const group = permission.group?.toLowerCase() ?? "";

      const matchesSearch =
        !search ||
        code.includes(search) ||
        module.includes(search) ||
        action.includes(search) ||
        group.includes(search);

      const matchesModule =
        filters.module === "all" || permission.module === filters.module;

      const matchesScope =
        filters.scope === "all" || permission.scope === filters.scope;

      const matchesLevel =
        filters.level === "all" || permission.level === filters.level;

      const matchesSensitive =
        filters.sensitive === "all" ||
        (filters.sensitive === "sensitive" && permission.isSensitive) ||
        (filters.sensitive === "normal" && !permission.isSensitive);

      return (
        matchesSearch &&
        matchesModule &&
        matchesScope &&
        matchesLevel &&
        matchesSensitive
      );
    });
  }, [data?.permissions, filters]);

  const updateFilter = <K extends keyof PermissionCatalogFilterState>(
    key: K,
    value: PermissionCatalogFilterState[K]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    permissions,
    modules: data?.modules ?? [],
    totalCount: data?.permissions?.length ?? 0,
    filteredCount: permissions.length,
    isLoading,
    error,
  };
}

export default usePermissionCatalog;