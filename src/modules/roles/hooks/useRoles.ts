//src/modules/roles/hooks/useRoles.ts
"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { roleService } from "../services";
import { RoleDto } from "../types";

export function useRoles() {
  const { locale } = useParams() as { locale?: string };
  const lang = locale ?? "tr";
  const tenantId = "default";

  const cacheKey = `roles:${tenantId}:${lang}`;

  const { data, error, isLoading, mutate, isValidating } = useSWR<RoleDto[]>(
    cacheKey,
    async () => {
   
      const result = await roleService.list({ lang, tenantId });

  

      return result;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: false,
    }
  );
 

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}