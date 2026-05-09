// src/modules/permissions/hooks/useRolePermissionMatrix.ts

"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getPermissionRoles,
  getRolePermissionMatrix,
  syncRolePermissions,
} from "../services/rolePermission.service";

import type {
  PermissionRoleDto,
  RolePermissionMatrixFilterState,
  RolePermissionMatrixItemDto,
} from "../types/Permission.types";

const INITIAL_FILTERS: RolePermissionMatrixFilterState = {
  search: "",
  module: "all",
  scope: "all",
  level: "all",
  sensitive: "all",
  assigned: "all",
};

const cloneMatrix = (
  items: RolePermissionMatrixItemDto[]
): RolePermissionMatrixItemDto[] =>
  items.map((item) => ({
    ...item,
    permission: { ...item.permission },
  }));

export function useRolePermissionMatrix() {
  const [roles, setRoles] = useState<PermissionRoleDto[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const [filters, setFilters] =
    useState<RolePermissionMatrixFilterState>(INITIAL_FILTERS);

  const [matrixItems, setMatrixItems] = useState<
    RolePermissionMatrixItemDto[]
  >([]);

  const [initialMatrixItems, setInitialMatrixItems] = useState<
    RolePermissionMatrixItemDto[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRole = useMemo<PermissionRoleDto | undefined>(
    () => roles.find((role) => role.id === selectedRoleId),
    [roles, selectedRoleId]
  );

  useEffect(() => {
    let alive = true;

    const loadRoles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPermissionRoles();

        if (!alive) return;

        setRoles(result);

        if (result.length > 0) {
          setSelectedRoleId((current) => current || result[0].id);
        }
      } catch (err) {
        if (!alive) return;

        setError(
          err instanceof Error
            ? err.message
            : "Roles could not be loaded."
        );
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;

    let alive = true;

    const loadMatrix = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getRolePermissionMatrix(selectedRoleId);

        if (!alive) return;

        const cloned = cloneMatrix(result.permissions);

        setMatrixItems(cloned);
        setInitialMatrixItems(cloneMatrix(result.permissions));
      } catch (err) {
        if (!alive) return;

        setError(
          err instanceof Error
            ? err.message
            : "Role permission matrix could not be loaded."
        );
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    loadMatrix();

    return () => {
      alive = false;
    };
  }, [selectedRoleId]);

  const filteredPermissions = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return matrixItems.filter((item) => {
      const permission = item.permission;

      const matchesSearch =
        !search ||
        permission.code.toLowerCase().includes(search) ||
        permission.module.toLowerCase().includes(search) ||
        permission.action.toLowerCase().includes(search);

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

      const matchesAssigned =
        filters.assigned === "all" ||
        (filters.assigned === "assigned" && item.assigned) ||
        (filters.assigned === "unassigned" && !item.assigned);

      return (
        matchesSearch &&
        matchesModule &&
        matchesScope &&
        matchesLevel &&
        matchesSensitive &&
        matchesAssigned
      );
    });
  }, [filters, matrixItems]);

  const changedItems = useMemo(() => {
    return matrixItems.filter((item) => {
      const initial = initialMatrixItems.find(
        (x) => x.permission.code === item.permission.code
      );

      return initial && initial.assigned !== item.assigned;
    });
  }, [initialMatrixItems, matrixItems]);

  const assignedCount = useMemo(
    () => matrixItems.filter((item) => item.assigned).length,
    [matrixItems]
  );

  const updateFilter = <K extends keyof RolePermissionMatrixFilterState>(
    key: K,
    value: RolePermissionMatrixFilterState[K]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const togglePermission = (permissionCode: string) => {
    setMatrixItems((current) =>
      current.map((item) => {
        if (item.permission.code !== permissionCode) return item;
        if (item.locked) return item;

        return {
          ...item,
          assigned: !item.assigned,
        };
      })
    );
  };

  const resetChanges = () => {
    setMatrixItems(cloneMatrix(initialMatrixItems));
  };

  const saveChanges = async () => {
    if (!selectedRoleId || changedItems.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const assignedPermissionCodes = matrixItems
        .filter((item) => item.assigned)
        .map((item) => item.permission.code);

      await syncRolePermissions({
        roleId: selectedRoleId,
        permissionCodes: assignedPermissionCodes,
      });

      setInitialMatrixItems(cloneMatrix(matrixItems));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Role permissions could not be synchronized."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    roles,
    selectedRole,
    selectedRoleId,
    setSelectedRoleId,

    filters,
    updateFilter,
    resetFilters,

    permissions: filteredPermissions,
    totalPermissions: matrixItems.length,
    assignedCount,
    changedItems,
    changedCount: changedItems.length,
    hasChanges: changedItems.length > 0,

    togglePermission,
    resetChanges,
    saveChanges,

    isLoading,
    isSaving,
    error,
  };
}

export default useRolePermissionMatrix;