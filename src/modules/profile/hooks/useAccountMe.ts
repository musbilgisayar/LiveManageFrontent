// src/modules/profile/hooks/useAccountMe.ts
// 📌 Bu hook, şu anki (authenticated) kullanıcının bilgilerini fetch etmek için kullanılır.
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getWebFetcher } from "@/utils/fetchers.web.client";
import type { UserDetailResponseDto } from "../../users/components/detail/cards/UserAccountDetailCard";

type RawResponse = any;

function unwrapMeResponse(json: RawResponse): Record<string, any> | null {
  const root = json?.data?.data ?? json?.data ?? null;

  if (!root || typeof root !== "object") {
    return null;
  }

  return {
    ...root,
    ...(root.user && typeof root.user === "object" ? root.user : {}),
  };
}

export function useAccountMe() {
  const { user: authUser, loading: authLoading } = useAuth();
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

      const userData = unwrapMeResponse(json);

      if (!userData) {
        setUser(null);
        setError("Kullanıcı bilgileri alınamadı.");
        return;
      }

      const normalizedUserData = {
        ...userData,

        // ✅ Backend effectivePermissions dolu döndüğü için
        // frontend menü/permission kontrollerinde permissions alanını da besliyoruz.
        permissions: userData.effectivePermissions ?? userData.permissions ?? [],

        // ✅ effectivePermissions alanını da kaybetmiyoruz.
        effectivePermissions:
          userData.effectivePermissions ?? userData.permissions ?? [],
      };

      setUser(normalizedUserData as unknown as UserDetailResponseDto);
    } catch (err: any) {
      setUser(null);
      setError(err?.message ?? "Kullanıcı bilgileri alınamadı (network).");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (authUser) {
      setUser(authUser as unknown as UserDetailResponseDto);
      setError(null);
      setIsLoading(false);
      return;
    }

    setUser(null);
    setError(null);
    setIsLoading(false);
  }, [authLoading, authUser]);

  return { user, isLoading: authLoading || isLoading, error, reload: fetchMe };
}
