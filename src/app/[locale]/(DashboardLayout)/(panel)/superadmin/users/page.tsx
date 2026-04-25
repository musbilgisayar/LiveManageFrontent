//src/app/[locale]/(DashboardLayout)/(panel)/superadmin/users/page.tsx
import UsersListView from "@/modules/users/pages/UsersListView";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function SuperAdminUsersPage({ params }: PageProps) {
  const { locale } = await params;

  return <UsersListView locale={locale} />;
}