// src/app/[locale]/(DashboardLayout)/(panel)/management-applications/review/[applicationId]/page.tsx

import AdminManagementApplicationDetailView from "@/modules/management-applications/views/AdminManagementApplicationDetailView";

type PageProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

export default async function ManagementApplicationReviewDetailPage({
  params,
}: PageProps) {
  const { applicationId } = await params;

  return <AdminManagementApplicationDetailView applicationId={applicationId} />;
}