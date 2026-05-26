"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import { getAppRoles } from "../services/appRole.service";

import { resolveRoleManagerErrorMessage }
  from "../utils/resolveRoleManagerErrorMessage";

import type {
  AppRoleListItemDto,
  AppRoleOption,
} from "../types/AppRole.types";

type UseAppRolesReturn = {
  roles: AppRoleListItemDto[];
  roleOptions: AppRoleOption[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
};

export default function useAppRoles(): UseAppRolesReturn {
  const { t } = useI18nNs("userRoleManager");

  const [roles, setRoles] = useState<AppRoleListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleOptions = useMemo<AppRoleOption[]>(
    () =>
      roles.map((role) => ({
        value: role.id,
        label: role.name,
        isSensitive: role.isSensitive,
        isSystem: role.isSystem,
        category: role.category,
      })),
    [roles],
  );

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getAppRoles();
      setRoles(data);
    } catch (error) {
      setRoles([]);
      setErrorMessage(
        resolveRoleManagerErrorMessage(
          error,
          "errors.rolesLoadFailed",
          t,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    roles,
    roleOptions,
    isLoading,
    errorMessage,
    reload: load,
  };
}
