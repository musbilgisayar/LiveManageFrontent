// src/app/[locale]/(DashboardLayout)/(panel)/localization/detail/page.tsx

import LocalizationDetailView from "@/modules/localization/views/LocalizationDetailView";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return <LocalizationDetailView locale={locale} />;
}