//src/app/[locale]/(DashboardLayout)/(panel)/my-profile/page.tsx
import UserDetailView from "@/modules/users/pages/UserDetailView";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;

  return <UserDetailView locale={locale} mode="self" />;
}