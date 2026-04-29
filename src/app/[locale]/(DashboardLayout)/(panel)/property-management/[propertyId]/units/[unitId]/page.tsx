// src/app/[locale]/(DashboardLayout)/(panel)/property-management/[propertyId]/units/[unitId]/page.tsx
 
import PropertyUnitDetailView from "@/modules/property-management/views/PropertyUnitDetailView";

export default function Page({
  params,
}: {
  params: { propertyId: string; unitId: string };
}) {
  return (
    <PropertyUnitDetailView
      propertyId={params.propertyId}
      unitId={params.unitId}
    />
  );
}