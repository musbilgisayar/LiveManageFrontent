import UserRoleManagerDashboardView
  from "@/modules/user-role-manager/views/UserRoleManagerDashboardView";
import PermissionGuard
  from "@/modules/auth/components/PermissionGuard";

const REQUIRED_PERMISSIONS = [
  "rolemanager.summary.view.tenant",
  "rolemanager.distribution.view.tenant",
  "rolemanager.users.view.tenant",
];

export default function Page() {
  return (
    <PermissionGuard
      requiredAnyPermissions={REQUIRED_PERMISSIONS}
    >
      <UserRoleManagerDashboardView />
    </PermissionGuard>
  );
}
