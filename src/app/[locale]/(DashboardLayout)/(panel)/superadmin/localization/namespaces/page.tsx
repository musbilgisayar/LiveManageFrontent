//src/app/%5Blocale%5D/%28DashboardLayout%29/%28panel%29/superadmin/localization/namespaces/page.tsx
import LocalizationNamespacesPage from "@/modules/localization/pages/manager/LocalizationNamespacesPage";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocalizationNamespacesRoutePage({
  params,
}: PageProps) {
  const { locale } = await params;

  return <LocalizationNamespacesPage locale={locale} />;
}