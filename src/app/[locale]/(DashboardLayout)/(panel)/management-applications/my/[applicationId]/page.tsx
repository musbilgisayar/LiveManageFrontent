import ManagementApplicationDetailView from "@/modules/management-applications/views/ManagementApplicationDetailView";

type PageProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

export default async function ManagementApplicationMyDetailPage({
  params,
}: PageProps) {
  const { applicationId } = await params;

  return <ManagementApplicationDetailView applicationId={applicationId} />;
}
