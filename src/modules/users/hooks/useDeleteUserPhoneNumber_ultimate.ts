// src/modules/users/hooks/useDeleteUserPhoneNumber_ultimate.ts

"use client";

import { useCallback, useMemo, useState } from "react";
import { deleteUserPhoneNumberUltimate } from "@/modules/users/services/userPhone.service_ultimate";
import { mapPhoneErrorToUiUltimate } from "@/modules/users/components/detail/tabs/phone-manager/helpers/phoneErrorMapper_ultimate";
import type { UiUserPhoneErrorUltimate } from "@/modules/users/types/UserPhone.types_ultimate";

interface UseDeleteUserPhoneNumberOptionsUltimate {
  onSuccess?: () => Promise<void> | void;
}

export function useDeleteUserPhoneNumberUltimate(
  options?: UseDeleteUserPhoneNumberOptionsUltimate
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<UiUserPhoneErrorUltimate | null>(null);

  const deletePhone = useCallback(
    async (userId: string, phoneId: string) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await deleteUserPhoneNumberUltimate(userId, phoneId);
        await options?.onSuccess?.();
      } catch (err) {
        const normalized = mapPhoneErrorToUiUltimate(err);
        setError(normalized);
        throw normalized;
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  const resetError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({
      deletePhone,
      isSubmitting,
      error,
      resetError,
    }),
    [deletePhone, isSubmitting, error, resetError]
  );
}