// src/modules/permissions/hooks/useRolePermissionMatrix.ts

"use client";

 


import {
  getPermissionRoles,
  getRolePermissionMatrix,
  syncRolePermissions,
  syncTenantPermissionCatalog,
} from "../services/rolePermission.service";
import { useCallback, useEffect, useMemo, useState } from "react";
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

export default function useRolePermissionMatrix() {
  const [roles, setRoles] = useState<PermissionRoleDto[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [isSyncingTenant, setIsSyncingTenant] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [filters, setFilters] =
    useState<RolePermissionMatrixFilterState>(INITIAL_FILTERS);

  const [matrixItems, setMatrixItems] = useState<RolePermissionMatrixItemDto[]>(
    []
  );

  const [initialMatrixItems, setInitialMatrixItems] = useState<
    RolePermissionMatrixItemDto[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId),
    [roles, selectedRoleId]
  );


  const loadRoles = useCallback(
  async (tenantId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPermissionRoles(tenantId);

      setRoles(result);

      setSelectedRoleId((current) => {
        const exists = result.some((role) => role.id === current);
        return exists ? current : result[0]?.id ?? "";
      });
    } catch (err) {
      setRoles([]);
      setSelectedRoleId("");
      setMatrixItems([]);
      setInitialMatrixItems([]);

      setError(
        err instanceof Error ? err.message : "permissions:role.list.loadError"
      );
    } finally {
      setIsLoading(false);
    }
  },
  []
);
  useEffect(() => {
    if (!selectedTenantId) {
      setRoles([]);
      setSelectedRoleId("");
      setMatrixItems([]);
      setInitialMatrixItems([]);
      return;
    }

    let alive = true;

   void loadRoles(selectedTenantId);
     

    return () => {
      alive = false;
    };
  }, [selectedTenantId, loadRoles]);

  useEffect(() => {
    if (!selectedTenantId || !selectedRoleId) {
      setMatrixItems([]);
      setInitialMatrixItems([]);
      return;
    }

    let alive = true;

    const loadMatrix = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getRolePermissionMatrix(
          selectedRoleId,
          selectedTenantId
        );

        if (!alive) return;

        const cloned = cloneMatrix(result.permissions);

        setMatrixItems(cloned);
        setInitialMatrixItems(cloneMatrix(result.permissions));
      } catch (err) {
        if (!alive) return;

        setMatrixItems([]);
        setInitialMatrixItems([]);

        setError(
          err instanceof Error
            ? err.message
            : "permissions:role.matrix.loadError"
        );
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    void loadMatrix();

    return () => {
      alive = false;
    };
  }, [selectedRoleId, selectedTenantId]);

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

  const syncTenantPermissions = async () => {
    if (!selectedTenantId) return;

    setIsSyncingTenant(true);
    setError(null);
    setSyncMessage(null);

    try {
      await syncTenantPermissionCatalog(selectedTenantId);

      await loadRoles(selectedTenantId);

      setSyncMessage("permissions:tenant.sync.success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "permissions:tenant.sync.error"
      );
    } finally {
      setIsSyncingTenant(false);
    }
  };

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

  const bulkAssignVisible = () => {
    const visibleCodes = new Set(
      filteredPermissions
        .filter((item) => !item.locked)
        .map((item) => item.permission.code)
    );

    setMatrixItems((current) =>
      current.map((item) =>
        visibleCodes.has(item.permission.code)
          ? { ...item, assigned: true }
          : item
      )
    );
  };

  const bulkUnassignVisible = () => {
    const visibleCodes = new Set(
      filteredPermissions
        .filter((item) => !item.locked)
        .map((item) => item.permission.code)
    );

    setMatrixItems((current) =>
      current.map((item) =>
        visibleCodes.has(item.permission.code)
          ? { ...item, assigned: false }
          : item
      )
    );
  };

  const saveChanges = async () => {
    if (!selectedTenantId || !selectedRoleId || changedItems.length === 0) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const assignedPermissionIds = matrixItems
        .filter((item) => item.assigned)
        .map((item) => item.permission.id)
        .filter(Boolean);

      await syncRolePermissions({
        tenantId: selectedTenantId,
        roleId: selectedRoleId,
        permissionIds: assignedPermissionIds,
        reason: "permissions:role.sync.reason.default",
      });

      const refreshed = await getRolePermissionMatrix(
        selectedRoleId,
        selectedTenantId
      );

      const cloned = cloneMatrix(refreshed.permissions);
      const refreshedAssignedCount = refreshed.permissions.filter(
        (item) => item.assigned
      ).length;

      setMatrixItems(cloned);
      setInitialMatrixItems(cloneMatrix(refreshed.permissions));
      setRoles((current) =>
        current.map((role) =>
          role.id === selectedRoleId
            ? {
              ...role,
              assignedPermissionCount: refreshedAssignedCount,
            }
            : role
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "permissions:role.sync.error"
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
    syncTenantPermissions,
    isSyncingTenant,
    syncMessage,
    selectedTenantId,
    setSelectedTenantId,

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

    bulkAssignVisible,
    bulkUnassignVisible,

    isLoading,
    isSaving,
    error,
  };
}
