// src/modules/profile/hooks/useAccountMe.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import type { UserDetailResponseDto } from "../../users/components/detail/cards/UserAccountDetailCard";

export function useAccountMe() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<UserDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    setIsLoading(false);
    setUser((authUser as unknown as UserDetailResponseDto) ?? null);
  }, [authUser]);

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

  return { user, isLoading: authLoading || isLoading, error, reload };
}
