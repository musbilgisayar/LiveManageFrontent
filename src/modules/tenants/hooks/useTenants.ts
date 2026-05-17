// src/modules/tenants/hooks/useTenants.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import {
  createTenant,
  getTenantById,
  getTenants,
  updateTenant,
  updateTenantStatus,
} from "../services/tenant.service";

import type {
  TenantCreateRequestDto,
  TenantDetailDto,
  TenantListItemDto,
  TenantUpdateRequestDto,
} from "../types/Tenant.types";

type UseTenantsState = {
  tenants: TenantListItemDto[];
  selectedTenant: TenantDetailDto | null;
  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  error: string | null;
};

export function useTenants(includeInactive = true) {
  const { t } = useI18nNs("tenants");

  const [state, setState] = useState<UseTenantsState>({
    tenants: [],
    selectedTenant: null,
    loading: true,
    detailLoading: false,
    saving: false,
    error: null,
  });

  const loadTenants = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const tenants = await getTenants({ includeInactive });

      setState((prev) => ({
        ...prev,
        tenants,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        tenants: [],
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : t("tenants:messages.listLoadFailed"),
      }));
    }
  }, [includeInactive, t]);

  const loadTenantDetail = useCallback(
    async (id: string) => {
      setState((prev) => ({
        ...prev,
        detailLoading: true,
        error: null,
      }));

      try {
        const detail = await getTenantById(id);

        setState((prev) => ({
          ...prev,
          selectedTenant: detail,
          detailLoading: false,
        }));

        return detail;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          selectedTenant: null,
          detailLoading: false,
          error:
            error instanceof Error
              ? error.message
              : t("tenants:messages.detailLoadFailed"),
        }));

        return null;
      }
    },
    [t]
  );

  const createNewTenant = useCallback(
    async (input: TenantCreateRequestDto) => {
      setState((prev) => ({
        ...prev,
        saving: true,
        error: null,
      }));

      try {
        const created = await createTenant(input);
        await loadTenants();

        setState((prev) => ({
          ...prev,
          selectedTenant: created,
          saving: false,
        }));

        return created;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          saving: false,
          error:
            error instanceof Error
              ? error.message
              : t("tenants:messages.createFailed"),
        }));

        return null;
      }
    },
    [loadTenants, t]
  );

  const updateExistingTenant = useCallback(
    async (id: string, input: TenantUpdateRequestDto) => {
      setState((prev) => ({
        ...prev,
        saving: true,
        error: null,
      }));

      try {
        const updated = await updateTenant(id, input);
        await loadTenants();

        setState((prev) => ({
          ...prev,
          selectedTenant: updated,
          saving: false,
        }));

        return updated;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          saving: false,
          error:
            error instanceof Error
              ? error.message
              : t("tenants:messages.updateFailed"),
        }));

        return null;
      }
    },
    [loadTenants, t]
  );

  const changeTenantStatus = useCallback(
    async (id: string, isActive: boolean) => {
      setState((prev) => ({
        ...prev,
        saving: true,
        error: null,
      }));

      try {
        const updated = await updateTenantStatus(id, { isActive });
        await loadTenants();

        setState((prev) => ({
          ...prev,
          selectedTenant: updated,
          saving: false,
        }));

        return updated;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          saving: false,
          error:
            error instanceof Error
              ? error.message
              : t("tenants:messages.statusUpdateFailed"),
        }));

        return null;
      }
    },
    [loadTenants, t]
  );

  const activeCount = useMemo(
    () => state.tenants.filter((tenant) => tenant.isActive).length,
    [state.tenants]
  );

  const passiveCount = useMemo(
    () => state.tenants.filter((tenant) => !tenant.isActive).length,
    [state.tenants]
  );

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  return {
    tenants: state.tenants,
    selectedTenant: state.selectedTenant,
    loading: state.loading,
    detailLoading: state.detailLoading,
    saving: state.saving,
    error: state.error,

    activeCount,
    passiveCount,
    totalCount: state.tenants.length,

    reload: loadTenants,
    loadTenantDetail,
    createNewTenant,
    updateExistingTenant,
    changeTenantStatus,
  };
}