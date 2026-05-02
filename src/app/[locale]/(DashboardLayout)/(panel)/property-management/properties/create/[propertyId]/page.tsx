import UnitListingCreateView from "@/modules/property-management/views/UnitListingCreateView";

type Props = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function CreateListingFromPropertyPage({ params }: Props) {
  const { propertyId } = await params;

  return (
    <UnitListingCreateView
      propertyId={propertyId}
      unitId="12"
    />
  );
}