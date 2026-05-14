// File: src/modules/permissions/hooks/useUserPermissionOverrides.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  PermissionUserLookupError,
  permissionUserLookupService,
} from "../services/permissionUserLookup.service";
import { userPermissionOverrideService } from "../services/userPermissionOverride.service";
import type { PermissionUserLookupItemDto } from "../types/PermissionUserLookup.types";
import type {
  PermissionDefinitionDto,
  UserPermissionCatalogRow,
  UserPermissionFilters,
  UserPermissionHistoryDto,
} from "../types/UserPermissionOverride.types";
import {
  buildPermissionRows,
  filterPermissionRows,
} from "../utils/userPermissionOverride.utils";

const initialFilters: UserPermissionFilters = {
  search: "",
  module: "all",
  scope: "all",
  source: "all",
  level: "all",
  viewMode: "table",
};

export function useUserPermissionOverrides() {
  const [users, setUsers] = useState<PermissionUserLookupItemDto[]>([]);
  const [selectedUser, setSelectedUser] =
    useState<PermissionUserLookupItemDto | null>(null);

  const [catalog, setCatalog] = useState<PermissionDefinitionDto[]>([]);
  const [rows, setRows] = useState<UserPermissionCatalogRow[]>([]);
  const [history, setHistory] = useState<UserPermissionHistoryDto[]>([]);

  const [filters, setFilters] =
    useState<UserPermissionFilters>(initialFilters);

  const [userSearch, setUserSearch] = useState("");
  const [reason, setReason] = useState("");

  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [savingPermissionId, setSavingPermissionId] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    try {
      const result =
        await userPermissionOverrideService.getCatalog();

      setCatalog(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Catalog yüklenemedi."
      );
    }
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    const trimmed = query.trim();

    if (!trimmed) {
      setUsers([]);
      setUserLoading(false);
      return;
    }

    setUserLoading(true);
    setError(null);

    try {
      const result =
        await permissionUserLookupService.searchUsers(trimmed);

      setUsers(result);
    } catch (err) {
      setUsers([]);

      if (err instanceof PermissionUserLookupError) {
        setError(err.message);

        if (err.status === 401) {
          setSelectedUser(null);
        }

        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Kullanıcı araması yapılamadı."
      );
    } finally {
      setUserLoading(false);
    }
  }, []);

  const loadUserPermissions = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);

      try {
        const [direct, effective] = await Promise.all([
          userPermissionOverrideService.getUserDirectPermissions(userId),
          userPermissionOverrideService.getUserEffectivePermissions(userId),
        ]);

        setRows(
          buildPermissionRows({
            catalog,
            direct,
            effective,
          })
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Permission listesi yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    },
    [catalog]
  );

  const loadHistory = useCallback(async () => {
    if (!selectedUser) return;

    setLoading(true);

    try {
      const result =
        await userPermissionOverrideService.getUserPermissionHistory(
          selectedUser.id
        );

      setHistory(result);
      setHistoryOpen(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "History yüklenemedi."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  const toggleDirectPermission = useCallback(
    async (
      row: UserPermissionCatalogRow,
      nextChecked: boolean
    ) => {
      if (!selectedUser) return;

      setSavingPermissionId(row.permissionId);
      setError(null);
      setSuccessMessage(null);

      try {
        const result = nextChecked
          ? await userPermissionOverrideService.assignPermission({
              userId: selectedUser.id,
              permissionId: row.permissionId,
              reason: reason || null,
            })
          : await userPermissionOverrideService.revokePermission({
              userId: selectedUser.id,
              permissionId: row.permissionId,
              reason: reason || null,
            });

        setSuccessMessage(
          result.userMessage ||
            result.message ||
            "İşlem tamamlandı."
        );

        await loadUserPermissions(selectedUser.id);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "İşlem tamamlanamadı."
        );
      } finally {
        setSavingPermissionId(null);
      }
    },
    [loadUserPermissions, reason, selectedUser]
  );

  const revokeAll = useCallback(async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result =
        await userPermissionOverrideService.revokeAll({
          userId: selectedUser.id,
          reason:
            reason ||
            "Bulk direct permission revoke from UI.",
        });

      setSuccessMessage(
        result.userMessage ||
          result.message ||
          "Tüm direct permission kayıtları kaldırıldı."
      );

      await loadUserPermissions(selectedUser.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Toplu kaldırma tamamlanamadı."
      );
    } finally {
      setLoading(false);
    }
  }, [loadUserPermissions, reason, selectedUser]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (selectedUser && catalog.length > 0) {
      void loadUserPermissions(selectedUser.id);
    }
  }, [catalog.length, loadUserPermissions, selectedUser]);

  const modules = useMemo(() => {
    return Array.from(
      new Set(
        catalog
          .map((x) => x.module)
          .filter(Boolean)
      )
    ).sort();
  }, [catalog]);

  const filteredRows = useMemo(
    () => filterPermissionRows(rows, filters),
    [filters, rows]
  );

  const summary = useMemo(() => {
    return {
      total: rows.length,
      direct: rows.filter((x) => x.isDirect).length,
      role: rows.filter((x) => x.isRoleSource).length,
      effective: rows.filter((x) => x.isEffective).length,
      missing: rows.filter((x) => !x.isEffective).length,
    };
  }, [rows]);

  return {
    users,
    selectedUser,
    setSelectedUser,

    catalog,
    rows,
    filteredRows,
    modules,

    filters,
    setFilters,

    userSearch,
    setUserSearch,
    searchUsers,

    reason,
    setReason,

    history,
    historyOpen,
    setHistoryOpen,

    loading,
    userLoading,
    savingPermissionId,

    error,
    successMessage,
    summary,

    toggleDirectPermission,
    revokeAll,
    loadHistory,
  };
}