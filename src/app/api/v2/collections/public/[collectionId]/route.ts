import dbConnect from "@/lib/dbConnect";
import CollectionModel from "@/model/Collection";
import { collectionIdParamsSchema } from "@/schemas/collectionSchema";
import { hydrateCollectionItems, serializeCollection } from "@/features/collection-v2/server/collection-items";

type RouteContext = { params: { collectionId: string } };

const COLLECTION_SELECT = "_id name description ownerUsername collectionType visibility itemIds createdAt updatedAt";

export async function GET(_request: Request, context: RouteContext) {
    const parsedParams = collectionIdParamsSchema.safeParse(context.params);
    if (!parsedParams.success) {
        return Response.json({ success: false, message: "Invalid collection id" }, { status: 400 });
    }

    await dbConnect();

    try {
        const collection = await CollectionModel.findOne({
            _id: parsedParams.data.collectionId,
            visibility: "public",
        }).select(COLLECTION_SELECT).lean();

        if (!collection) {
            return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
        }

        const items = await hydrateCollectionItems({
            collectionType: collection.collectionType,
            itemIds: collection.itemIds,
            ownerUsername: collection.ownerUsername,
            visibility: "public",
        });

        return Response.json({
            success: true,
            message: "Public collection fetched successfully",
            collection: serializeCollection(collection),
            items,
            isOwner: false,
        });
    } catch {
        return Response.json({ success: false, message: "Error fetching public collection" }, { status: 500 });
    }
}
