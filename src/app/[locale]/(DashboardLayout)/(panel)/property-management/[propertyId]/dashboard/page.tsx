// src/app/[locale]/(DashboardLayout)/(panel)/property-management/[propertyId]/dashboard/page.tsx
import PropertyManagementDashboardView from "@/modules/property-management/views/PropertyManagementDashboardView";

export default function Page({ params }: { params: { propertyId: string } }) {
  return <PropertyManagementDashboardView propertyId={params.propertyId} />;
}