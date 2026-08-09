import { getAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import CollectionModel from "@/model/Collection";
import { collectionIdParamsSchema, updateCollectionMetadataSchema } from "@/schemas/collectionSchema";
import {
    hydrateCollectionItems,
    serializeCollection,
    validateOwnedCollectionItems,
} from "@/features/collection-v2/server/collection-items";

type RouteContext = { params: { collectionId: string } };

const COLLECTION_SELECT = "_id name description ownerUsername collectionType visibility itemIds createdAt updatedAt";

export async function GET(request: Request, context: RouteContext) {
    const parsedParams = collectionIdParamsSchema.safeParse(context.params);
    if (!parsedParams.success) {
        return Response.json({ success: false, message: parsedParams.error.issues[0]?.message ?? "Invalid collection id" }, { status: 400 });
    }

    const currentUsername = await getAuthenticatedUsername(request);
    await dbConnect();

    try {
        const collection = await CollectionModel.findById(parsedParams.data.collectionId)
            .select(COLLECTION_SELECT)
            .lean();
        if (!collection) {
            return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
        }

        const isOwner = collection.ownerUsername === currentUsername;
        if (!isOwner && collection.visibility !== "public") {
            return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
        }

        const items = await hydrateCollectionItems({
            collectionType: collection.collectionType,
            itemIds: collection.itemIds,
            ownerUsername: collection.ownerUsername,
            visibility: isOwner ? "private" : collection.visibility,
        });

        return Response.json({
            success: true,
            message: "Collection fetched successfully",
            collection: serializeCollection(collection),
            items,
            isOwner,
        });
    } catch {
        return Response.json({ success: false, message: "Error fetching collection" }, { status: 500 });
    }
}

export async function PATCH(request: Request, context: RouteContext) {
    const currentUsername = await getAuthenticatedUsername(request);
    if (!currentUsername) {
        return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const parsedParams = collectionIdParamsSchema.safeParse(context.params);
    if (!parsedParams.success) {
        return Response.json({ success: false, message: parsedParams.error.issues[0]?.message ?? "Invalid collection id" }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    const parsedBody = updateCollectionMetadataSchema.safeParse(body);
    if (!parsedBody.success) {
        return Response.json({ success: false, message: parsedBody.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }

    await dbConnect();

    try {
        const collection = await CollectionModel.findOne({
            _id: parsedParams.data.collectionId,
            ownerUsername: currentUsername,
        });
        if (!collection) {
            return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
        }

        if (parsedBody.data.visibility === "public" && collection.visibility !== "public") {
            const itemsArePublic = await validateOwnedCollectionItems({
                collectionType: collection.collectionType,
                itemIds: collection.itemIds,
                ownerUsername: currentUsername,
                visibility: "public",
            });
            if (!itemsArePublic) {
                return Response.json({
                    success: false,
                    message: "Make every item public before publishing this collection",
                }, { status: 400 });
            }
        }

        collection.set(parsedBody.data);
        await collection.save();

        return Response.json({
            success: true,
            message: "Collection metadata updated successfully",
            collection: serializeCollection(collection.toObject()),
        });
    } catch {
        return Response.json({ success: false, message: "Error updating collection" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    const currentUsername = await getAuthenticatedUsername(request);
    if (!currentUsername) {
        return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const parsedParams = collectionIdParamsSchema.safeParse(context.params);
    if (!parsedParams.success) {
        return Response.json({ success: false, message: parsedParams.error.issues[0]?.message ?? "Invalid collection id" }, { status: 400 });
    }

    await dbConnect();

    try {
        const deletedCollection = await CollectionModel.findOneAndDelete({
            _id: parsedParams.data.collectionId,
            ownerUsername: currentUsername,
        });
        if (!deletedCollection) {
            return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
        }
        return Response.json({ success: true, message: "Collection deleted successfully" });
    } catch {
        return Response.json({ success: false, message: "Error deleting collection" }, { status: 500 });
    }
}
