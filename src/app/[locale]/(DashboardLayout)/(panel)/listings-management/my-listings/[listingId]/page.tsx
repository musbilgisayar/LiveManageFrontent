import ListingDetailView from "@/modules/property-management/views/ListingDetailView"


type Props = {
  params: Promise<{
    listingId: string;
  }>;
};

export default async function ListingDetailPage({ params }: Props) {
  const { listingId } = await params;

  return <ListingDetailView listingId={listingId} />;
}