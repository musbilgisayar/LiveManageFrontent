import ListingEditView from "@/modules/listing-management/views/ListingEditView";

type Props = {
  params: Promise<{
    listingId: string;
  }>;
};

export default async function ListingEditPage({ params }: Props) {
  const { listingId } = await params;

  return <ListingEditView listingId={listingId} />;
}