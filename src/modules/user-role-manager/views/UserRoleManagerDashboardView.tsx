"use client";

import { useMemo, useState } from "react";

import {
  Alert,
  Grid,
  Stack,
} from "@mui/material";

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

const TENANT_OPTIONS = [
  {
    id: "livemanage",
    name: "LiveManage",
  },
  {
    id: "kulturtisch",
    name: "KulturTisch",
  },
];

export default function UserRoleManagerDashboardView() {
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
      usersErrorMessage,
    [
      distributionErrorMessage,
      summaryErrorMessage,
      usersErrorMessage,
    ],
  );

  return (
    <Stack spacing={3}>
      <RoleManagerPageHeader
        title="User Role Manager"
        subtitle="Role assignment and role visibility management"
        actions={
          <RoleScopeSelector
            value={scope}
            tenantOptions={TENANT_OPTIONS}
            onChange={setScope}
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
          <RoleDistributionTable
            items={distributionItems}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
          }}
        >
          <Stack spacing={3}>
            <RoleManagerUserFilters
              filters={filters}
              roles={roles}
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