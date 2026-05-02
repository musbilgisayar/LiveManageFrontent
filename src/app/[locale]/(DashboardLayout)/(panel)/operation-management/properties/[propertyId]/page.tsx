// src/app/[locale]/(DashboardLayout)/(panel)/operation-management/properties/[propertyId]/page.tsx

import PropertyOperationsDashboardView from "@/modules/property-operations/views/PropertyOperationsDashboardView";

type PageProps = {
  params: Promise<{
    locale: string;
    propertyId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { propertyId } = await params;

  return <PropertyOperationsDashboardView propertyId={propertyId} />;
}