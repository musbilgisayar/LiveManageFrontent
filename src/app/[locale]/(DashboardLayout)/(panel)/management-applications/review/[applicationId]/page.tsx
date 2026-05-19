// src/app/[locale]/(DashboardLayout)/(panel)/management-applications/review/[applicationId]/page.tsx

import PermissionGuard from "@/modules/auth/components/PermissionGuard";
import AdminManagementApplicationDetailView from "@/modules/management-applications/views/AdminManagementApplicationDetailView";

type PageProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

const REVIEW_DETAIL_PERMISSIONS = [
  "admin.property.applications.detail.tenant",
  "admin.property.applications.detail.global",
  "admin.property.applications.view_pending.tenant",
  "admin.property.applications.view_pending.global",
];

export default async function ManagementApplicationReviewDetailPage({
  params,
}: PageProps) {
  const { applicationId } = await params;

  return (
    <PermissionGuard requiredAnyPermissions={REVIEW_DETAIL_PERMISSIONS}>
      <AdminManagementApplicationDetailView applicationId={applicationId} />
    </PermissionGuard>
  );
}
