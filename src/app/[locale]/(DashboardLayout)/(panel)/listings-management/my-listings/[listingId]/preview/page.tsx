import ListingPreviewView from "@/modules/listing-management/views/ListingPreviewView";

type Props = {
  params: Promise<{
    listingId: string;
  }>;
};

export default async function ListingPreviewPage({ params }: Props) {
  const { listingId } = await params;

  return <ListingPreviewView listingId={listingId} />;
}