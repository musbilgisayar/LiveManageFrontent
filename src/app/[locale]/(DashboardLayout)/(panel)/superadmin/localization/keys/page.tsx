import LocalizationKeysPage from "@/modules/localization/pages/manager/LocalizationKeysPage";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocalizationKeysRoutePage({ params }: PageProps) {
  const { locale } = await params;

  return <LocalizationKeysPage locale={locale} />;
}