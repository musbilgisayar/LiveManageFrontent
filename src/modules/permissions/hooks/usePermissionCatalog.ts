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

    load();

    return () => {
      alive = false;
    };
  }, []);

  const permissions = useMemo<PermissionDefinitionDto[]>(() => {
    if (!data) return [];

    const search = filters.search.trim().toLowerCase();

    return data.permissions.filter((permission) => {
      const matchesSearch =
        !search ||
        permission.code.toLowerCase().includes(search) ||
        permission.module.toLowerCase().includes(search) ||
        permission.action.toLowerCase().includes(search) ||
        permission.group.toLowerCase().includes(search);

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
  }, [data, filters]);

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
    totalCount: data?.permissions.length ?? 0,
    filteredCount: permissions.length,
    isLoading,
    error,
  };
}

export default usePermissionCatalog;