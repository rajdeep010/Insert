import { CollectionDetail } from "@/features/collection-v2/components/CollectionDetail";

export default function CollectionDetailPage({ params }: { params: { collectionId: string } }) {
    return <CollectionDetail collectionId={params.collectionId} />;
}
