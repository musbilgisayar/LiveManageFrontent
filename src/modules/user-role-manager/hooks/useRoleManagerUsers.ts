"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import { getRoleManagerUsers } from "../services/roleManager.service";

import { resolveRoleManagerErrorMessage }
  from "../utils/resolveRoleManagerErrorMessage";

import type {
  PagedResult,
  RoleManagerScopeState,
  RoleManagerUserFilters,
  RoleManagerUserListItemDto,
} from "../types/RoleManager.types";

type UseRoleManagerUsersReturn = {
  users: RoleManagerUserListItemDto[];
  pagination: PagedResult<RoleManagerUserListItemDto> | null;
  filters: RoleManagerUserFilters;
  setFilters: React.Dispatch<React.SetStateAction<RoleManagerUserFilters>>;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
};

const INITIAL_FILTERS: RoleManagerUserFilters = {
  search: "",
  isVerified: null,
  isSuspended: null,
  roleId: null,
  hasActiveRole: null,
};

export default function useRoleManagerUsers(
  scope: RoleManagerScopeState,
): UseRoleManagerUsersReturn {
  const { t } = useI18nNs("userRoleManager");

  const [pagination, setPagination] =
    useState<PagedResult<RoleManagerUserListItemDto> | null>(null);
  const [filters, setFilters] =
    useState<RoleManagerUserFilters>(INITIAL_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const users = useMemo(
    () => pagination?.items ?? [],
    [pagination],
  );

  useEffect(() => {
    setPageNumber(1);
  }, [
    filters.hasActiveRole,
    filters.isSuspended,
    filters.isVerified,
    filters.roleId,
    filters.search,
    pageSize,
    scope.mode,
    scope.tenantId,
  ]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getRoleManagerUsers({
        tenantId: scope.tenantId,
        allTenants: scope.mode === "allTenants",
        pageNumber,
        pageSize,
        search: filters.search || null,
        isVerified: filters.isVerified,
        isSuspended: filters.isSuspended,
        roleId: filters.roleId,
        hasActiveRole: filters.hasActiveRole,
      });

      setPagination(data);
    } catch (error) {
      setPagination(null);
      setErrorMessage(
        resolveRoleManagerErrorMessage(
          error,
          "errors.usersLoadFailed",
          t,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.hasActiveRole,
    filters.isSuspended,
    filters.isVerified,
    filters.roleId,
    filters.search,
    pageNumber,
    pageSize,
    scope.mode,
    scope.tenantId,
    t,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    users,
    pagination,
    filters,
    setFilters,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    isLoading,
    errorMessage,
    reload: load,
  };
}
