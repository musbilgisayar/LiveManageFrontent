//src/app/[locale]/(DashboardLayout)/(panel)/superadmin/users/[userId]/page.tsx
import UserDetailView from "@/modules/users/pages/UserDetailView";

type Props = {
  params: Promise<{
    locale: string;
    userId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { locale, userId } = await params;

  return <UserDetailView locale={locale} userId={userId} />;
}