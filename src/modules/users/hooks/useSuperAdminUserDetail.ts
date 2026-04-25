//src/modules/users/hooks/useSuperAdminUserDetail.ts
"use client";

import useSWR from "swr";
import { getSuperAdminUserDetail } from "../services/superAdminUsers.service";

export function useSuperAdminUserDetail(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ["superadmin-user-detail", userId] : null,
    () => getSuperAdminUserDetail(userId!),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    user: data,
    isLoading,
    error,
    mutate,
  };
}