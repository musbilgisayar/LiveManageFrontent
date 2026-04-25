



//src/app/[locale]/(DashboardLayout)/(panel)/superadmin/localization/[encodedKey]/page.tsx
import LocalizationDetailPage from "@/modules/localization/pages/LocalizationDetailPage";

type PageProps = {
  params: Promise<{
    locale: string;
    encodedKey: string;
  }>;
};

export default async function LocalizationDetailRoutePage({ params }: PageProps) {
  const { locale, encodedKey } = await params;

  return (
    <LocalizationDetailPage
      locale={locale}
      encodedKey={encodedKey}
    />
  );
}