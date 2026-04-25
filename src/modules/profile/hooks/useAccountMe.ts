//src/modules/profile/hooks/useAccountMe.ts
// 📌 Bu hook, şu anki (authenticated) kullanıcının bilgilerini fetch etmek için kullanılır.
"use client";

import { useCallback, useEffect, useState } from "react";
import { getWebFetcher } from "@/utils/fetchers.web.client";
import type { UserDetailResponseDto } from "../../users/components/detail/cards/UserAccountDetailCard";

type RawResponse = any;

export function useAccountMe() {
  const [user, setUser] = useState<UserDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/v1.0/account/users/me`;

      const json = (await getWebFetcher(url)) as RawResponse;

      if (!json?.ok) {
        setUser(null);
        setError("Kullanıcı bilgileri alınamadı.");
        return;
      }

      const userData = json?.data ?? null;

      setUser(userData);
    } catch (err: any) {
      setUser(null);
      setError(err?.message ?? "Kullanıcı bilgileri alınamadı (network).");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return { user, isLoading, error, reload: fetchMe };
}