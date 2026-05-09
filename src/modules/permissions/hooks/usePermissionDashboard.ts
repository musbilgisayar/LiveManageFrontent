// src/modules/permissions/hooks/usePermissionDashboard.ts

"use client";

import { useMemo } from "react";

import { PERMISSION_DASHBOARD_MOCK } from "../utils/permissionMockData";
import type {
  PermissionDashboardDto,
  PermissionModuleSummaryDto,
  PermissionRecentChangeDto,
} from "../types/Permission.types";

export type PermissionDashboardMetric = {
  id: string;
  labelKey: string;
  fallbackLabel: string;
  value: number;
  helperKey?: string;
  fallbackHelper?: string;
  severity: "default" | "success" | "warning" | "error" | "info";
};

type UsePermissionDashboardResult = {
  data: PermissionDashboardDto;
  metrics: PermissionDashboardMetric[];
  modules: PermissionModuleSummaryDto[];
  recentChanges: PermissionRecentChangeDto[];
  isLoading: boolean;
  error: string | null;
};

export function usePermissionDashboard(): UsePermissionDashboardResult {
  const data = PERMISSION_DASHBOARD_MOCK;

  const metrics = useMemo<PermissionDashboardMetric[]>(
    () => [
      {
        id: "totalPermissions",
        labelKey: "permissions:dashboard.cards.totalPermissions",
        fallbackLabel: "Toplam Permission",
        value: data.summary.totalPermissions,
        helperKey: "permissions:dashboard.cards.totalPermissions.helper",
        fallbackHelper: "Sistemde tanımlı toplam permission sayısı",
        severity: "info",
      },
      {
        id: "activePermissions",
        labelKey: "permissions:dashboard.cards.activePermissions",
        fallbackLabel: "Aktif Permission",
        value: data.summary.activePermissions,
        helperKey: "permissions:dashboard.cards.activePermissions.helper",
        fallbackHelper: "Kullanılabilir durumda olan permission sayısı",
        severity: "success",
      },
      {
        id: "modules",
        labelKey: "permissions:dashboard.cards.modules",
        fallbackLabel: "Modül Sayısı",
        value: data.summary.moduleCount,
        helperKey: "permissions:dashboard.cards.modules.helper",
        fallbackHelper: "Permission tanımlı modül sayısı",
        severity: "default",
      },
      {
        id: "sensitivePermissions",
        labelKey: "permissions:dashboard.cards.sensitivePermissions",
        fallbackLabel: "Hassas Permission",
        value: data.summary.sensitivePermissionCount,
        helperKey: "permissions:dashboard.cards.sensitivePermissions.helper",
        fallbackHelper: "Ek dikkat gerektiren kritik permission sayısı",
        severity: "warning",
      },
      {
        id: "roleAssignments",
        labelKey: "permissions:dashboard.cards.roleAssignments",
        fallbackLabel: "Rol Atamaları",
        value: data.summary.roleAssignmentCount,
        helperKey: "permissions:dashboard.cards.roleAssignments.helper",
        fallbackHelper: "Rollere atanmış permission kayıtları",
        severity: "info",
      },
      {
        id: "userOverrides",
        labelKey: "permissions:dashboard.cards.userOverrides",
        fallbackLabel: "Kullanıcı İstisnaları",
        value: data.summary.userOverrideCount,
        helperKey: "permissions:dashboard.cards.userOverrides.helper",
        fallbackHelper: "Kullanıcı bazlı özel permission istisnaları",
        severity: "error",
      },
    ],
    [data.summary]
  );

  return {
    data,
    metrics,
    modules: data.modules,
    recentChanges: data.recentChanges,
    isLoading: false,
    error: null,
  };
}