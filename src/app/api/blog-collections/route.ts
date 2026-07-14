import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedAccessToken, getAuthenticatedUsername } from "@/lib/api/auth";
import { resolveEntityPermissions } from "@/lib/collaboration/permissions";
import BlogCollectionModel from "@/model/BlogCollection";
import BlogModel from "@/model/Blog";
import TopicModel from "@/model/Topic";
import { createBlogCollectionSchema } from "@/schemas/blogCollectionSchema";

type LinkedTopicRecord = {
	_id: unknown;
	creator_username: string;
	visibility: string;
};

const COLLECTION_LIST_SELECT = "_id name description ownerUsername visibility linkedTopicId blogIds createdAt updatedAt";

export async function GET(request: Request) {
	const currentUsername = await getAuthenticatedUsername(request);

	if (!currentUsername) {
		return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
	}

	await dbConnect();

	try {
		// Get pagination parameters
		const url = new URL(request.url);
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
		const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
		const skip = (page - 1) * limit;

		const [collections, total] = await Promise.all([
			BlogCollectionModel.find({ ownerUsername: currentUsername })
				.sort({ updatedAt: -1, createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.select(COLLECTION_LIST_SELECT)
				.lean(),
			BlogCollectionModel.countDocuments({ ownerUsername: currentUsername }),
		]);

		const totalPages = Math.ceil(total / limit);

		return Response.json(
			{
				success: true,
				message: "Collections fetched successfully",
				collections,
				pagination: {
					page,
					limit,
					total,
					pages: totalPages,
					hasNextPage: page < totalPages,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching collections:', error);
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

	const parsedBody = createBlogCollectionSchema.safeParse(body);

	if (!parsedBody.success) {
		return Response.json({ success: false, message: parsedBody.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
	}

	await dbConnect();

	try {
		if (parsedBody.data.linkedTopicId) {
			const linkedTopic = await TopicModel.findOne({ id: parsedBody.data.linkedTopicId })
				.select("_id creator_username visibility")
				.lean<LinkedTopicRecord | null>();

			if (!linkedTopic) {
				return Response.json({ success: false, message: "Linked topic not found" }, { status: 404 });
			}

			const accessToken = await getAuthenticatedAccessToken(request);
			const topicPermissions = await resolveEntityPermissions({
				entityType: "TOPIC",
				entityId: parsedBody.data.linkedTopicId,
				visibility: linkedTopic.visibility,
				ownerUsername: linkedTopic.creator_username,
				currentUsername,
				accessToken,
			});

			if (!topicPermissions.canEdit) {
				return Response.json({ success: false, message: "You are not allowed to link this topic" }, { status: 403 });
			}
		}

		if (parsedBody.data.blogIds.length > 0) {
			const blogFilter = parsedBody.data.visibility === "public"
				? {
					_id: { $in: parsedBody.data.blogIds },
					creator: currentUsername,
					status: "active",
					type: "public",
				}
				: {
					_id: { $in: parsedBody.data.blogIds },
					creator: currentUsername,
					status: "active",
				};

			const ownedBlogs = await BlogModel.find(blogFilter).select("_id");

			if (ownedBlogs.length !== new Set(parsedBody.data.blogIds).size) {
				return Response.json({ success: false, message: parsedBody.data.visibility === "public" ? "Public collections can only include published public blogs" : "One or more blogs are invalid for this collection" }, { status: 400 });
			}
		}

		const collection = await BlogCollectionModel.create({
			name: parsedBody.data.name,
			description: parsedBody.data.description,
			ownerUsername: currentUsername,
			visibility: parsedBody.data.visibility,
			linkedTopicId: parsedBody.data.linkedTopicId || null,
			blogIds: Array.from(new Set(parsedBody.data.blogIds)),
		});

		return Response.json({ success: true, message: "Collection created successfully", collection }, { status: 201 });
	} catch {
		return Response.json({ success: false, message: "Error creating collection" }, { status: 500 });
	}
}