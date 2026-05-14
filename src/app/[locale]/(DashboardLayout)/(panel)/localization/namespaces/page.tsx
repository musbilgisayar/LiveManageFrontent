// src/app/[locale]/(DashboardLayout)/(panel)/localization/namespaces/page.tsx

import LocalizationNamespacesView from "@/modules/localization/views/LocalizationNamespacesView";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return <LocalizationNamespacesView locale={locale} />;
}