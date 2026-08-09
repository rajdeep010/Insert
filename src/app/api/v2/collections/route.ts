import { getAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import CollectionModel from "@/model/Collection";
import { collectionListQuerySchema, createCollectionSchema } from "@/schemas/collectionSchema";
import {
    serializeCollection,
    uniqueCollectionItemIds,
    validateOwnedCollectionItems,
} from "@/features/collection-v2/server/collection-items";

const COLLECTION_SELECT = "_id name description ownerUsername collectionType visibility itemIds createdAt updatedAt";

export async function GET(request: Request) {
    const currentUsername = await getAuthenticatedUsername(request);
    if (!currentUsername) {
        return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const url = new URL(request.url);
    const parsedQuery = collectionListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsedQuery.success) {
        return Response.json({ success: false, message: parsedQuery.error.issues[0]?.message ?? "Invalid query" }, { status: 400 });
    }

    await dbConnect();

    try {
        const { page, limit, type, visibility } = parsedQuery.data;
        const filter = {
            ownerUsername: currentUsername,
            ...(type ? { collectionType: type } : {}),
            ...(visibility ? { visibility } : {}),
        };
        const [collections, total] = await Promise.all([
            CollectionModel.find(filter)
                .sort({ updatedAt: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select(COLLECTION_SELECT)
                .lean(),
            CollectionModel.countDocuments(filter),
        ]);
        const pages = Math.ceil(total / limit);

        return Response.json({
            success: true,
            message: "Collections fetched successfully",
            collections: collections.map(serializeCollection),
            pagination: { page, limit, total, pages, hasNextPage: page < pages },
        });
    } catch {
        return Response.json({ success: false, message: "Error fetching collections" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const currentUsername = await getAuthenticatedUsername(request);
    if (!currentUsername) {
        return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    const parsedBody = createCollectionSchema.safeParse(body);
    if (!parsedBody.success) {
        return Response.json({ success: false, message: parsedBody.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }

    await dbConnect();

    try {
        const itemIds = uniqueCollectionItemIds(parsedBody.data.itemIds);
        const itemsAreValid = await validateOwnedCollectionItems({
            collectionType: parsedBody.data.collectionType,
            itemIds,
            ownerUsername: currentUsername,
            visibility: parsedBody.data.visibility,
        });
        if (!itemsAreValid) {
            return Response.json({
                success: false,
                message: parsedBody.data.visibility === "public"
                    ? "Public collections can only contain your public items"
                    : "One or more items are invalid for this collection",
            }, { status: 400 });
        }

        const collection = await CollectionModel.create({
            name: parsedBody.data.name,
            description: parsedBody.data.description,
            ownerUsername: currentUsername,
            collectionType: parsedBody.data.collectionType,
            visibility: parsedBody.data.visibility,
            itemIds,
        });

        return Response.json({
            success: true,
            message: "Collection created successfully",
            collection: serializeCollection(collection.toObject()),
        }, { status: 201 });
    } catch {
        return Response.json({ success: false, message: "Error creating collection" }, { status: 500 });
    }
}
