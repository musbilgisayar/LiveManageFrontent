"use client";

import { useCallback, useEffect, useState } from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import { getMyManagementApplications } from "../services/managementApplication.service";

import type { ManagedPropertyApplicationListItemDto } from "../types/managementApplication.types";

const NS = "management-applications:myList";

function resolveMessage(
  userMessage: string | null | undefined,
  message: string | null | undefined,
  fallback: string,
) {
  return userMessage || message || fallback;
}

export default function useManagementApplicationList() {
  const { t } = useI18nNs("management-applications");

  const [items, setItems] = useState<ManagedPropertyApplicationListItemDto[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getMyManagementApplications();

      if (!response.ok) {
        setItems([]);

        setErrorMessage(
          resolveMessage(
            response.userMessage,
            response.message,
            t(`${NS}.load.error`),
          ),
        );

        return;
      }

      setItems(Array.isArray(response.data) ? response.data : []);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    items,
    isLoading,
    errorMessage,
    reload: load,
  };
}
