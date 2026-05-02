//src/app/[locale]/(DashboardLayout)/(panel)/listings-management/create/property/[propertyId]/unit/[unitId]/page.tsx

 
import UnitListingCreateView from "@/modules/property-management/views/UnitListingCreateView";

type Props = {
  params: Promise<{
    propertyId: string;
    unitId: string;
  }>;
};

export default async function CreateListingFromUnitPage({ params }: Props) {
  const { propertyId, unitId } = await params;

  return <UnitListingCreateView propertyId={propertyId} unitId={unitId} />;
}