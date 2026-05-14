import LocalizationManagerView from "@/modules/localization/views/LocalizationManagerView2";

type PageProps = {
  params: {
    locale: string;
  };
};

export default function Page({ params }: PageProps) {
  return <LocalizationManagerView locale={params.locale} />;
}