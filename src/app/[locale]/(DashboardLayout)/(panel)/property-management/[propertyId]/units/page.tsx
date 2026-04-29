// src/app/[locale]/(DashboardLayout)/(panel)/property-management/[propertyId]/units/page.tsx
import PropertyUnitsView from "@/modules/property-management/views/PropertyUnitsView";

export default function Page({ params }: { params: { propertyId: string } }) {
  return <PropertyUnitsView propertyId={params.propertyId} />;
}