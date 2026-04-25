//src/app/[locale]/(DashboardLayout)/(panel)/superadmin/localization/page.tsx
import { LocalizationListPage } from "@/modules/localization";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function SuperAdminLocalizationPage({ params }: PageProps) {
  const { locale } = await params;

  return <LocalizationListPage locale={locale} />;
}