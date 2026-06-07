// src/app/[locale]/(DashboardLayout)/(panel)/pending-actions/page.tsx

import PermissionGuard from "@/modules/auth/components/PermissionGuard";
import PendingActionsView from "@/modules/pending-actions/views/PendingActionsView";

export default function Page() {
  return (
    <PermissionGuard
      requiredAnyPermissions={[
        "admin.property.applications.view_pending.tenant",
      ]}
    >
      <PendingActionsView />
    </PermissionGuard>
  );
}