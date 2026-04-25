// src/modules/users/hooks/useCreateUserPhoneNumber_ultimate.ts

"use client";

import { useCallback, useMemo, useState } from "react";
import { createUserPhoneNumberUltimate } from "@/modules/users/services/userPhone.service_ultimate";
import { mapPhoneErrorToUiUltimate } from "@/modules/users/components/detail/tabs/phone-manager/helpers/phoneErrorMapper_ultimate";
import type {
  UiUserPhoneErrorUltimate,
  UserPhoneNumberCreateRequestUltimate,
  UserPhoneNumberDtoUltimate,
} from "@/modules/users/types/UserPhone.types_ultimate";

interface UseCreateUserPhoneNumberOptionsUltimate {
  onSuccess?: (created: UserPhoneNumberDtoUltimate | null) => Promise<void> | void;
}

export function useCreateUserPhoneNumberUltimate(
  options?: UseCreateUserPhoneNumberOptionsUltimate
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<UiUserPhoneErrorUltimate | null>(null);

  const createPhone = useCallback(
    async (
      payload: UserPhoneNumberCreateRequestUltimate
    ): Promise<UserPhoneNumberDtoUltimate | null> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const created = await createUserPhoneNumberUltimate(payload);
        await options?.onSuccess?.(created);
        return created;
      } catch (err) {
        const normalized = mapPhoneErrorToUiUltimate(err);
        setError(normalized);
        throw new Error(normalized.message || "Telefon kaydı oluşturulamadı.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      createPhone,
      isSubmitting,
      error,
      resetError,
    }),
    [createPhone, isSubmitting, error, resetError]
  );
}

