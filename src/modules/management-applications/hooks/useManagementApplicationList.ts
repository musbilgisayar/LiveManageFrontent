"use client";

import { useCallback, useEffect, useState } from "react";
import { getMyManagementApplications } from "../services/managementApplication.service";
import type { ManagedPropertyApplicationListItemDto,} from "../types/managementApplication.types";

export default function useManagementApplicationList() {
  const [items, setItems] = useState<
    ManagedPropertyApplicationListItemDto[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await getMyManagementApplications();

      if (!response.ok) {
        setItems([]);

        setErrorMessage(
          response.userMessage ||
            response.message ||
            "Başvurular yüklenemedi.",
        );

        return;
      }

      setItems(
        Array.isArray(response.data)
          ? response.data
          : [],
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

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