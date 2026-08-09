import dbConnect from "@/lib/dbConnect";
import CollectionModel from "@/model/Collection";
import { collectionListQuerySchema } from "@/schemas/collectionSchema";
import { serializeCollection } from "@/features/collection-v2/server/collection-items";

const COLLECTION_SELECT = "_id name description ownerUsername collectionType visibility itemIds createdAt updatedAt";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const parsedQuery = collectionListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsedQuery.success) {
        return Response.json({ success: false, message: parsedQuery.error.issues[0]?.message ?? "Invalid query" }, { status: 400 });
    }

    await dbConnect();

    try {
        const { page, limit, type, owner } = parsedQuery.data;
        const filter = {
            visibility: "public" as const,
            ...(type ? { collectionType: type } : {}),
            ...(owner ? { ownerUsername: owner } : {}),
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
            message: "Public collections fetched successfully",
            collections: collections.map(serializeCollection),
            pagination: { page, limit, total, pages, hasNextPage: page < pages },
        });
    } catch {
        return Response.json({ success: false, message: "Error fetching public collections" }, { status: 500 });
    }
}
