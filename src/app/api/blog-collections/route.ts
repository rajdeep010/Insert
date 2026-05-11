import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import BlogCollectionModel from "@/model/BlogCollection";
import BlogModel from "@/model/Blog";
import TopicModel from "@/model/Topic";
import { createBlogCollectionSchema } from "@/schemas/blogCollectionSchema";

const COLLECTION_LIST_SELECT = "_id name description ownerUsername visibility linkedTopicId blogIds createdAt updatedAt";

export async function GET(request: Request) {
	const currentUsername = await getAuthenticatedUsername(request);

	if (!currentUsername) {
		return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
	}

	await dbConnect();

	try {
		const collections = await BlogCollectionModel.find({ ownerUsername: currentUsername })
			.sort({ updatedAt: -1, createdAt: -1 })
			.select(COLLECTION_LIST_SELECT);

		return Response.json({ success: true, message: "Collections fetched successfully", collections }, { status: 200 });
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

	const parsedBody = createBlogCollectionSchema.safeParse(body);

	if (!parsedBody.success) {
		return Response.json({ success: false, message: parsedBody.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
	}

	await dbConnect();

	try {
		if (parsedBody.data.linkedTopicId) {
			const linkedTopic = await TopicModel.findOne({ id: parsedBody.data.linkedTopicId }).select("_id creator_username collaborators");

			if (!linkedTopic) {
				return Response.json({ success: false, message: "Linked topic not found" }, { status: 404 });
			}

			const canAccessTopic =
				linkedTopic.creator_username === currentUsername ||
				linkedTopic.collaborators?.some((collaborator: { username: string }) => collaborator.username === currentUsername);

			if (!canAccessTopic) {
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