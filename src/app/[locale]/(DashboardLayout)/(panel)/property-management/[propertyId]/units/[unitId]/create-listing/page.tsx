import UnitListingCreateView from "@/modules/property-management/views/UnitListingCreateView";

export default function Page({
  params,
}: {
  params: { propertyId: string; unitId: string };
}) {
  return <UnitListingCreateView propertyId={params.propertyId} unitId={params.unitId} />;
}