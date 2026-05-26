"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import {
  assignRole,
  getUserActiveRoles,
  getUserRoleHistory,
  revokeAllRoles,
  revokeRole,
  syncUserRoles,
} from "../services/userRoleAssignment.service";

import { resolveRoleManagerErrorMessage }
  from "../utils/resolveRoleManagerErrorMessage";

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
  syncRoles: (payload: UserRoleSyncRequestDto) => Promise<void>;
  revokeAllUserRoles: (
    payload?: UserRoleChangeReasonDto,
  ) => Promise<void>;
};

export default function useUserRoleAssignments(
  userId: string | null,
): UseUserRoleAssignmentsReturn {
  const { t } = useI18nNs("userRoleManager");

  const [activeRoles, setActiveRoles] = useState<AppUserRoleDto[]>([]);
  const [roleHistory, setRoleHistory] = useState<AppUserRoleHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      const [roles, history] = await Promise.all([
        getUserActiveRoles(userId),
        getUserRoleHistory(userId),
      ]);

      setActiveRoles(roles);
      setRoleHistory(history);
    } catch (error) {
      setActiveRoles([]);
      setRoleHistory([]);
      setErrorMessage(
        resolveRoleManagerErrorMessage(
          error,
          "errors.assignmentsLoadFailed",
          t,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [t, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const assignUserRole = useCallback(
    async (
      roleId: string,
      payload?: UserRoleChangeReasonDto,
    ) => {
      if (!userId) return;

      try {
        setIsSubmitting(true);
        setErrorMessage(null);

        await assignRole(userId, roleId, payload);
        await load();
      } catch (error) {
        setErrorMessage(
          resolveRoleManagerErrorMessage(
            error,
            "errors.assignRoleFailed",
            t,
          ),
        );
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [load, t, userId],
  );

  const revokeUserRole = useCallback(
    async (
      roleId: string,
      payload?: UserRoleChangeReasonDto,
    ) => {
      if (!userId) return;

      try {
        setIsSubmitting(true);
        setErrorMessage(null);

        await revokeRole(userId, roleId, payload);
        await load();
      } catch (error) {
        setErrorMessage(
          resolveRoleManagerErrorMessage(
            error,
            "errors.revokeRoleFailed",
            t,
          ),
        );
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [load, t, userId],
  );

  const syncRoles = useCallback(
    async (payload: UserRoleSyncRequestDto) => {
      if (!userId) return;

      try {
        setIsSubmitting(true);
        setErrorMessage(null);

        await syncUserRoles(userId, payload);
        await load();
      } catch (error) {
        setErrorMessage(
          resolveRoleManagerErrorMessage(
            error,
            "errors.syncRolesFailed",
            t,
          ),
        );
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [load, t, userId],
  );

  const revokeAllUserRoles = useCallback(
    async (payload?: UserRoleChangeReasonDto) => {
      if (!userId) return;

      try {
        setIsSubmitting(true);
        setErrorMessage(null);

        await revokeAllRoles(userId, payload);
        await load();
      } catch (error) {
        setErrorMessage(
          resolveRoleManagerErrorMessage(
            error,
            "errors.revokeAllFailed",
            t,
          ),
        );
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [load, t, userId],
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
