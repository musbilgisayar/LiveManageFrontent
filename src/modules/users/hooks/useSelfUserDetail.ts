"use client";

import useSWR from "swr";
import { getSelfUserDetail } from "../services/selfUserDetail.service";

type Options = {
  enabled?: boolean;
};

export function useSelfUserDetail(options: Options = {}) {
  const { enabled = true } = options;

  const { data, error, isLoading, mutate } = useSWR(
    enabled ? ["self-user-detail"] : null,
    getSelfUserDetail,
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