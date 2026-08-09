import { getAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import CollectionModel from "@/model/Collection";
import { collectionIdParamsSchema, updateCollectionItemsSchema } from "@/schemas/collectionSchema";
import {
    areCollectionItemIdsWellFormed,
    serializeCollection,
    uniqueCollectionItemIds,
    validateOwnedCollectionItems,
} from "@/features/collection-v2/server/collection-items";

type RouteContext = { params: { collectionId: string } };

export async function POST(request: Request, context: RouteContext) {
    return updateCollectionItems(request, context, "add");
}

export async function DELETE(request: Request, context: RouteContext) {
    return updateCollectionItems(request, context, "remove");
}

async function updateCollectionItems(
    request: Request,
    context: RouteContext,
    mode: "add" | "remove",
) {
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

    const parsedBody = updateCollectionItemsSchema.safeParse(body);
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

        const requestedItemIds = uniqueCollectionItemIds(parsedBody.data.itemIds);
        if (!areCollectionItemIdsWellFormed(collection.collectionType, requestedItemIds)) {
            return Response.json({ success: false, message: "One or more item ids are invalid" }, { status: 400 });
        }

        if (mode === "add") {
            const combinedItemIds = uniqueCollectionItemIds([...collection.itemIds, ...requestedItemIds]);
            if (combinedItemIds.length > 100) {
                return Response.json({ success: false, message: "A collection can contain at most 100 items" }, { status: 400 });
            }

            const itemsAreValid = await validateOwnedCollectionItems({
                collectionType: collection.collectionType,
                itemIds: requestedItemIds,
                ownerUsername: currentUsername,
                visibility: collection.visibility,
            });
            if (!itemsAreValid) {
                return Response.json({
                    success: false,
                    message: collection.visibility === "public"
                        ? "Public collections can only contain your public items"
                        : "One or more items are invalid for this collection",
                }, { status: 400 });
            }
            collection.itemIds = combinedItemIds;
        } else {
            const removals = new Set(requestedItemIds);
            collection.itemIds = collection.itemIds.filter((itemId) => !removals.has(itemId));
        }

        await collection.save();
        return Response.json({
            success: true,
            message: mode === "add" ? "Items added to collection" : "Items removed from collection",
            collection: serializeCollection(collection.toObject()),
        });
    } catch {
        return Response.json({ success: false, message: "Error updating collection items" }, { status: 500 });
    }
}
