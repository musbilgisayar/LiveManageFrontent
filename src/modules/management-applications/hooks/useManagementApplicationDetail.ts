//bu dosya, yönetim başvurularının detaylarını göstermek için kullanılan bir custom hook olan useManagementApplicationDetail'i içerir. Bu hook, belirli bir başvuru ID'sine sahip yönetim başvurusunun detaylarını almak için kullanılır. Hook, başvuru detaylarını, yüklenme durumunu ve hata mesajlarını yönetir. Ayrıca, başvuru detaylarını yeniden yüklemek için bir fonksiyon da sağlar.

//src/modules/management-applications/hooks/useManagementApplicationDetail.ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { getManagementApplicationDetail } from "../services/managementApplicationDetail.service";

import type { ManagementApplicationDetail } from "../types/managementApplicationDetail.types";

export default function useManagementApplicationDetail(applicationId: string) {
  const [data, setData] = useState<ManagementApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!applicationId) {
      setData(null);
      setErrorMessage("management-applications:detail.load.missingApplicationId");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getManagementApplicationDetail(applicationId);

      if (!response.ok || !response.data) {
        setData(null);
        setErrorMessage(
          response.userMessage ||
            response.message ||
            "management-applications:detail.load.error",
        );
        return;
      }

      setData(response.data);
    } catch (error) {
      console.error("[useManagementApplicationDetail][load] failed", error);

      setData(null);
      setErrorMessage("management-applications:detail.load.unexpectedError");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    isLoading,
    errorMessage,
    reload: load,
  };
}