"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  assignRole,
  getUserActiveRoles,
  getUserRoleHistory,
  revokeAllRoles,
  revokeRole,
  syncUserRoles,
} from "../services/userRoleAssignment.service";

import type {
  AppUserRoleDto,
  AppUserRoleHistoryDto,
  UserRoleChangeReasonDto,
  UserRoleSyncRequestDto,
} from "../types/UserRoleAssignment.types";

type UseUserRoleAssignmentsReturn = {
  activeRoles: AppUserRoleDto[];

  roleHistory: AppUserRoleHistoryDto[];

  isLoading: boolean;

  isSubmitting: boolean;

  errorMessage: string | null;

  reload: () => Promise<void>;

  assignUserRole: (
    roleId: string,
    payload?: UserRoleChangeReasonDto,
  ) => Promise<void>;

  revokeUserRole: (
    roleId: string,
    payload?: UserRoleChangeReasonDto,
  ) => Promise<void>;

  syncRoles: (
    payload: UserRoleSyncRequestDto,
  ) => Promise<void>;

  revokeAllUserRoles: (
    payload?: UserRoleChangeReasonDto,
  ) => Promise<void>;
};

export default function useUserRoleAssignments(
  userId: string | null,
): UseUserRoleAssignmentsReturn {
  const [activeRoles, setActiveRoles] =
    useState<AppUserRoleDto[]>([]);

  const [roleHistory, setRoleHistory] =
    useState<AppUserRoleHistoryDto[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setActiveRoles([]);
      setRoleHistory([]);
      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);

      setErrorMessage(null);

      const [roles, history] =
        await Promise.all([
          getUserActiveRoles(userId),
          getUserRoleHistory(userId),
        ]);

      setActiveRoles(roles);

      setRoleHistory(history);
    } catch (error) {
      setActiveRoles([]);

      setRoleHistory([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Kullanıcı rol bilgileri alınamadı.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const assignUserRole = useCallback(
    async (
      roleId: string,
      payload?: UserRoleChangeReasonDto,
    ) => {
      if (!userId) {
        return;
      }

      try {
        setIsSubmitting(true);

        setErrorMessage(null);

        await assignRole(
          userId,
          roleId,
          payload,
        );

        await load();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Rol atama işlemi başarısız oldu.",
        );

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [load, userId],
  );

  const revokeUserRole = useCallback(
    async (
      roleId: string,
      payload?: UserRoleChangeReasonDto,
    ) => {
      if (!userId) {
        return;
      }

      try {
        setIsSubmitting(true);

        setErrorMessage(null);

        await revokeRole(
          userId,
          roleId,
          payload,
        );

        await load();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Rol kaldırma işlemi başarısız oldu.",
        );

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [load, userId],
  );

  const syncRoles = useCallback(
    async (
      payload: UserRoleSyncRequestDto,
    ) => {
      if (!userId) {
        return;
      }

      try {
        setIsSubmitting(true);

        setErrorMessage(null);

        await syncUserRoles(
          userId,
          payload,
        );

        await load();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Rol senkronizasyonu başarısız oldu.",
        );

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [load, userId],
  );

  const revokeAllUserRoles = useCallback(
    async (
      payload?: UserRoleChangeReasonDto,
    ) => {
      if (!userId) {
        return;
      }

      try {
        setIsSubmitting(true);

        setErrorMessage(null);

        await revokeAllRoles(
          userId,
          payload,
        );

        await load();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Tüm roller kaldırılamadı.",
        );

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [load, userId],
  );

  return {
    activeRoles,
    roleHistory,

    isLoading,
    isSubmitting,

    errorMessage,

    reload: load,

    assignUserRole,
    revokeUserRole,
    syncRoles,
    revokeAllUserRoles,
  };
}