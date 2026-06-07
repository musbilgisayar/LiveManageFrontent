"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getAdminManagementApplicationDetail,
  getGlobalAdminManagementApplicationDetail,
} from "../services/adminManagementApplication.service";
import { useIsSuperAdminScope } from "./useAdminManagementReviewList";

import type { AdminManagementApplicationDetail } from "../types/adminManagementApplication.types";

export default function useManagementApplicationReviewDetail(
  applicationId: string,
) {
  const isSuperAdmin = useIsSuperAdminScope();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "tr";

  const [data, setData] =
    useState<AdminManagementApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!applicationId) {
      setData(null);
      setErrorMessage("admin.detail.load.missingApplicationId");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = isSuperAdmin
        ? await getGlobalAdminManagementApplicationDetail(applicationId)
        : await getAdminManagementApplicationDetail(applicationId);

      if (!response.ok || !response.data) {
        setData(null);
        setErrorMessage(
          response.userMessage ||
            response.message ||
            "admin.detail.load.error",
        );
        return;
      }

      setData(response.data);
    } catch (error) {
      console.error("[useManagementApplicationReviewDetail][load] failed", error);
      setData(null);
      setErrorMessage("admin.detail.load.unexpectedError");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, isSuperAdmin, locale]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    isLoading,
    errorMessage,
    isSuperAdmin,
    reload: load,
  };
}
