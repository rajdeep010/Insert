import { PublicCollectionPost } from '@/features/blog/components/PublicCollectionPost'

export default function CollectionPostPage({ params }: { params: { collectionId: string } }) {
	return <PublicCollectionPost collectionId={params.collectionId} />
}