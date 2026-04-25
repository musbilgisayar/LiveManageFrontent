// src/modules/users/hooks/useUserPhoneNumbers_ultimate.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { sortPhonesUltimate } from "@/modules/users/components/detail/tabs/phone-manager/helpers/phoneDisplay_ultimate";
import { mapPhoneErrorToUiUltimate } from "@/modules/users/components/detail/tabs/phone-manager/helpers/phoneErrorMapper_ultimate";
import { getUserPhoneNumbersUltimate } from "@/modules/users/services/userPhone.service_ultimate";
import type {
  UiUserPhoneErrorUltimate,
  UserPhoneNumberDtoUltimate,
} from "@/modules/users/types/UserPhone.types_ultimate";

interface UseUserPhoneNumbersOptionsUltimate {
  enabled?: boolean;
}

export function useUserPhoneNumbersUltimate(
  userId: string | undefined,
  options?: UseUserPhoneNumbersOptionsUltimate
) {
  const enabled = options?.enabled ?? true;

  const [items, setItems] = useState<UserPhoneNumberDtoUltimate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<UiUserPhoneErrorUltimate | null>(null);

  const fetchItems = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!userId || !enabled) {
        setItems([]);
        setError(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (mode === "initial") {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const response = await getUserPhoneNumbersUltimate(userId);
        setItems(sortPhonesUltimate(response));
      } catch (err) {
        setError(mapPhoneErrorToUiUltimate(err));
      } finally {
        if (mode === "initial") {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [enabled, userId]
  );

  useEffect(() => {
    void fetchItems("initial");
  }, [fetchItems]);

  const refresh = useCallback(async () => {
    await fetchItems("refresh");
  }, [fetchItems]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      items,
      isLoading,
      isRefreshing,
      error,
      refresh,
      resetError,
    }),
    [items, isLoading, isRefreshing, error, refresh, resetError]
  );
}