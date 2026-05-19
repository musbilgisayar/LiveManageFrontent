"use client";

import { useMemo } from "react";

import { useParams } from "next/navigation";
import useSWR from "swr";

import { roleService } from "../services";
import type { RoleDto } from "../types";

type UseRolesOptions = {
  tenantId?: string;
  search?: string;
};

function normalizeSearch(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function filterRoles(roles: RoleDto[], search: string) {
  if (!search) return roles;

  return roles.filter((role) => {
    const name = role.name?.toLowerCase() ?? "";
    const description = role.description?.toLowerCase() ?? "";

    return name.includes(search) || description.includes(search);
  });
}

export function useRoles(options: UseRolesOptions = {}) {
  const { locale } = useParams() as { locale?: string };

  const lang = locale ?? "tr";
  const tenantId = options.tenantId ?? "default";
  const search = normalizeSearch(options.search);

  const cacheKey = ["roles", tenantId, lang] as const;

  const {
    data,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR<RoleDto[]>(
    cacheKey,
    async () => {
      const result = await roleService.list({
        lang,
        tenantId,
      });

      return Array.isArray(result) ? result : [];
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    },
  );

  const roles = useMemo(
    () => filterRoles(data ?? [], search),
    [data, search],
  );

  return {
    data: roles,
    rawData: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}