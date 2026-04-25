//src/modules/users/hooks/useSuperAdminUsers.ts
"use client";

import useSWR from "swr";
import { getSuperAdminUsers } from "../services/superAdminUsers.service";
import { UserListQueryParams } from "../types/user.filters.types";

export function useSuperAdminUsers(params: UserListQueryParams) {
  const key = [
    "superadmin-users",
    params.pageNumber ?? 1,
    params.pageSize ?? 10,
    params.search ?? "",
  ];

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => getSuperAdminUsers(params),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    users: data?.items ?? [],
    pagination: {
      pageNumber: data?.pageNumber ?? 1,
      pageSize: data?.pageSize ?? params.pageSize ?? 10,
      totalCount: data?.totalCount ?? 0,
      totalPages: data?.totalPages ?? 0,
    },
    isLoading,
    error,
    mutate,
  };
}