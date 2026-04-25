// src/modules/users/hooks/useUpdateUserPhoneNumber_ultimate.ts
// bu dosya, kullanıcıların telefon numaralarını güncellemek için kullanılan özel bir React hook'u içerir. Bu hook, telefon numarası güncelleme işlemini yönetir, API çağrısını yapar, hata durumlarını işler ve başarılı güncellemeler için geri bildirim sağlar. Ayrıca, güncelleme işlemi sırasında oluşabilecek hataları kullanıcı dostu mesajlara dönüştürmek için yardımcı fonksiyonlar da içerir. Bu sayede, uygulamanın diğer bölümlerinde kullanıcı telefon numarası güncelleme işlemi daha kolay ve tutarlı hale gelir.
"use client";

import { useCallback, useMemo, useState } from "react";
import { updateUserPhoneNumberUltimate } from "@/modules/users/services/userPhone.service_ultimate";
import { mapPhoneErrorToUiUltimate } from "@/modules/users/components/detail/tabs/phone-manager/helpers/phoneErrorMapper_ultimate";
import type {
  UiUserPhoneErrorUltimate,
  UserPhoneNumberDtoUltimate,
  UserPhoneNumberUpdateRequestUltimate,
} from "@/modules/users/types/UserPhone.types_ultimate";

interface UseUpdateUserPhoneNumberOptionsUltimate {
  onSuccess?: (updated: UserPhoneNumberDtoUltimate | null) => Promise<void> | void;
}

export function useUpdateUserPhoneNumberUltimate(
  options?: UseUpdateUserPhoneNumberOptionsUltimate
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<UiUserPhoneErrorUltimate | null>(null);

  const updatePhone = useCallback(
    async (payload: UserPhoneNumberUpdateRequestUltimate & { userId: string }) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const updated = await updateUserPhoneNumberUltimate(payload);
        await options?.onSuccess?.(updated);
        return updated;
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
      updatePhone,
      isSubmitting,
      error,
      resetError,
    }),
    [updatePhone, isSubmitting, error, resetError]
  );
}