// src/app/[locale]/(DashboardLayout)/(panel)/management-applications/review/page.tsx

import PermissionGuard from "@/modules/auth/components/PermissionGuard";
import ManagementApplicationReviewListView from "@/modules/management-applications/views/ManagementApplicationReviewListView";

const REVIEW_PERMISSIONS = [
  "admin.property.applications.view_pending.tenant",
  "admin.property.applications.view_pending.global",
];

export default function ManagementApplicationReviewPage() {
  return (
    <PermissionGuard requiredAnyPermissions={REVIEW_PERMISSIONS}>
      <ManagementApplicationReviewListView />
    </PermissionGuard>
  );
}
