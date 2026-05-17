// src/modules/tenants/hooks/useTenantOptions.ts

"use client";

import { useCallback, useEffect, useState } from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import { getTenantOptions } from "../services/tenant.service";

import type { TenantOptionDto } from "../types/Tenant.types";

type UseTenantOptionsState = {
  options: TenantOptionDto[];
  loading: boolean;
  error: string | null;
};

export function useTenantOptions(includeInactive = false) {
  const { t } = useI18nNs("tenants");

  const [state, setState] = useState<UseTenantOptionsState>({
    options: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const options = await getTenantOptions({ includeInactive });

      setState({
        options,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        options: [],
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : t("tenants:messages.optionsLoadFailed"),
      });
    }
  }, [includeInactive, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    options: state.options,
    loading: state.loading,
    error: state.error,
    reload: load,
  };
}