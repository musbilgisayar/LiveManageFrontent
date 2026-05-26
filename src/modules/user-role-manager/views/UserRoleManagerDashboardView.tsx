//src/modules/user-role-manager/views/UserRoleManagerDashboardView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Grid,
  Stack,
} from "@mui/material";

import { useTenantOptions }
  from "@/modules/tenants/hooks/useTenantOptions";

import { useI18nNs }
  from "@/app/context/i18nContext";

import useAppRoles
  from "../hooks/useAppRoles";

import useRoleDistribution
  from "../hooks/useRoleDistribution";

import useRoleManagerSummary
  from "../hooks/useRoleManagerSummary";

import useRoleManagerUsers
  from "../hooks/useRoleManagerUsers";

import useUserRoleAssignments
  from "../hooks/useUserRoleAssignments";

import RoleManagerSummaryCards
  from "../components/dashboard/RoleManagerSummaryCards";

import RoleDistributionTable
  from "../components/distribution/RoleDistributionTable";

import UserRoleHistoryDrawer
  from "../components/history/UserRoleHistoryDrawer";

import UserRoleAssignmentDialog
  from "../components/assignment/UserRoleAssignmentDialog";

import RoleManagerPageHeader
  from "../components/shared/RoleManagerPageHeader";

import RoleScopeSelector
  from "../components/shared/RoleScopeSelector";

import RoleManagerUserFilters
  from "../components/users/RoleManagerUserFilters";

import RoleManagerUsersTable
  from "../components/users/RoleManagerUsersTable";

import type {
  RoleManagerScopeState,
  RoleManagerUserListItemDto,
} from "../types/RoleManager.types";

export default function UserRoleManagerDashboardView() {
  const { t } = useI18nNs("userRoleManager");

  const [scope, setScope] =
    useState<RoleManagerScopeState>({
      mode: "currentTenant",
      tenantId: null,
    });

  const [selectedUser, setSelectedUser] =
    useState<RoleManagerUserListItemDto | null>(
      null,
    );

  const [historyOpen, setHistoryOpen] =
    useState(false);

  const [assignmentOpen, setAssignmentOpen] =
    useState(false);

  const {
    options: tenantOptions,
    loading: tenantsLoading,
    error: tenantsError,
  } = useTenantOptions(false);

  useEffect(() => {
    if (
      scope.mode !== "specificTenant" ||
      scope.tenantId ||
      tenantOptions.length === 0
    ) {
      return;
    }

    setScope((current) => ({
      ...current,
      tenantId: tenantOptions[0].id,
    }));
  }, [
    scope.mode,
    scope.tenantId,
    tenantOptions,
  ]);

  const {
    summary,
    errorMessage:
      summaryErrorMessage,
  } = useRoleManagerSummary(scope);

  const {
    items: distributionItems,
    errorMessage:
      distributionErrorMessage,
  } = useRoleDistribution(scope);

  const {
    users,
    filters,
    setFilters,
    errorMessage:
      usersErrorMessage,
    pagination,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    isLoading:
      usersLoading,
  } = useRoleManagerUsers(scope);

  const {
    roles,
  } = useAppRoles();

  const {
    activeRoles,
    roleHistory,
    isSubmitting,
    syncRoles,
  } = useUserRoleAssignments(
    selectedUser?.userId ?? null,
  );

  const errorMessage = useMemo(
    () =>
      summaryErrorMessage ||
      distributionErrorMessage ||
      usersErrorMessage ||
      tenantsError,
    [
      distributionErrorMessage,
      summaryErrorMessage,
      tenantsError,
      usersErrorMessage,
    ],
  );

  const normalizedTenantOptions = useMemo(
    () =>
      tenantOptions.map((tenant) => ({
        id: tenant.id,
        name: `${tenant.name} (${tenant.key})`,
      })),
    [tenantOptions],
  );

  return (
    <Stack spacing={3}>
      <RoleManagerPageHeader
        title={t("page.title")}
        subtitle={t("page.subtitle")}
        actions={
          <RoleScopeSelector
            value={scope}
            tenantOptions={normalizedTenantOptions}
            onChange={setScope}
            disabled={tenantsLoading}
          />
        }
      />

      {errorMessage && (
        <Alert severity="error">
          {errorMessage}
        </Alert>
      )}

      <RoleManagerSummaryCards
        summary={summary}
      />

      <Grid
  container
  spacing={3}
>
  <Grid
    size={{
      xs: 12,
    }}
  >
    <Stack spacing={3}>
      <RoleManagerUserFilters
        filters={filters}
        roles={roles}
        disabled={usersLoading}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            search: "",
            isVerified: null,
            isSuspended: null,
            roleId: null,
            hasActiveRole: null,
          })
        }
      />

      <RoleManagerUsersTable
        users={users}
        pagination={pagination}
        pageNumber={pageNumber}
        pageSize={pageSize}
        isLoading={usersLoading}
        onPageChange={setPageNumber}
        onPageSizeChange={setPageSize}
        onHistoryClick={(user) => {
          setSelectedUser(user);

          setHistoryOpen(true);
        }}
        onRolesClick={(user) => {
          setSelectedUser(user);

          setAssignmentOpen(true);
        }}
      />
    </Stack>
  </Grid>

  <Grid
    size={{
      xs: 12,
      lg: 5,
    }}
  >
    <RoleDistributionTable
      items={distributionItems}
    />
  </Grid>
</Grid>
      <UserRoleHistoryDrawer
        open={historyOpen}
        items={roleHistory}
        onClose={() =>
          setHistoryOpen(false)
        }
      />

      <UserRoleAssignmentDialog
        open={assignmentOpen}
        roles={roles}
        activeRoles={activeRoles}
        isSubmitting={isSubmitting}
        onClose={() =>
          setAssignmentOpen(false)
        }
        onSync={async (
          roleIds,
          reason,
        ) => {
          await syncRoles({
            roleIds,
            reason,
          });

          setAssignmentOpen(false);
        }}
      />
    </Stack>
  );
}
