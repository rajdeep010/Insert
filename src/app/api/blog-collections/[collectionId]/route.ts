import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedAccessToken, requireAuthenticatedUsername } from "@/lib/api/auth";
import { resolveEntityPermissions } from "@/lib/collaboration/permissions";
import BlogCollectionModel from "@/model/BlogCollection";
import BlogModel from "@/model/Blog";
import TopicModel from "@/model/Topic";
import {
	collectionIdParamsSchema,
	updateBlogCollectionSchema,
} from "@/schemas/blogCollectionSchema";

type RouteContext = {
	params: {
		collectionId: string;
	};
};

const COLLECTION_SELECT = "_id name description ownerUsername visibility linkedTopicId blogIds createdAt updatedAt";
const COLLECTION_BLOG_SELECT = "_id blogTitle blogContentText blogUrl type creator blogBannerImage createdAt lastEdited status autosave";

export async function GET(request: Request, context: RouteContext) {
	const authResult = await requireAuthenticatedUsername(request);
	if (authResult instanceof Response) {
		return authResult;
	}
	const currentUsername = authResult;

	const parsedParams = collectionIdParamsSchema.safeParse(context.params);
	if (!parsedParams.success) {
		return Response.json({ success: false, message: parsedParams.error.issues[0]?.message ?? "Invalid collection id" }, { status: 400 });
	}

	await dbConnect();

	try {
		const collection = await BlogCollectionModel.findOne({
			_id: parsedParams.data.collectionId,
		}).select(COLLECTION_SELECT);

		if (!collection) {
			return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
		}

		const isOwner = collection.ownerUsername === currentUsername;
		if (!isOwner && collection.visibility !== "public") {
			return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
		}

		const blogFilter = isOwner
			? {
				_id: { $in: collection.blogIds },
				creator: currentUsername,
			}
			: {
				_id: { $in: collection.blogIds },
				status: "active",
				type: "public",
			};

		const blogs = await BlogModel.find(blogFilter).select(COLLECTION_BLOG_SELECT).lean();
		const blogMap = new Map(blogs.map((blog) => [String(blog._id), blog]));
		const orderedBlogs = collection.blogIds
			.map((blogId) => blogMap.get(String(blogId)))
			.filter(Boolean);

		if (!isOwner && collection.blogIds.length > 0 && orderedBlogs.length === 0) {
			return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
		}

		return Response.json({ success: true, message: "Collection fetched successfully", collection, blogs: orderedBlogs, isOwner }, { status: 200 });
	} catch {
		return Response.json({ success: false, message: "Error fetching collection" }, { status: 500 });
	}
}

export async function PATCH(request: Request, context: RouteContext) {
	const authResult = await requireAuthenticatedUsername(request);
	if (authResult instanceof Response) {
		return authResult;
	}
	const currentUsername = authResult;

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

	const parsedBody = updateBlogCollectionSchema.safeParse(body);
	if (!parsedBody.success) {
		return Response.json({ success: false, message: parsedBody.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
	}

	await dbConnect();

	try {
		const existingCollection = await BlogCollectionModel.findOne({
			_id: parsedParams.data.collectionId,
			ownerUsername: currentUsername,
		});

		if (!existingCollection) {
			return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
		}

		if (parsedBody.data.linkedTopicId) {
			const linkedTopic = await TopicModel.findOne({ id: parsedBody.data.linkedTopicId }).select("_id creator_username visibility");
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

		const nextVisibility = parsedBody.data.visibility ?? existingCollection.visibility;
		if (nextVisibility === "public" && existingCollection.blogIds.length > 0) {
			const publicBlogs = await BlogModel.find({
				_id: { $in: existingCollection.blogIds },
				creator: currentUsername,
				status: "active",
				type: "public",
			}).select("_id");

			if (publicBlogs.length !== new Set(existingCollection.blogIds.map((blogId) => String(blogId))).size) {
				return Response.json({ success: false, message: "Public collections can only include published public blogs" }, { status: 400 });
			}
		}

		const updatedCollection = await BlogCollectionModel.findOneAndUpdate(
			{ _id: parsedParams.data.collectionId, ownerUsername: currentUsername },
			{ $set: parsedBody.data },
			{ new: true, runValidators: true }
		).select(COLLECTION_SELECT);

		return Response.json({ success: true, message: "Collection updated successfully", collection: updatedCollection }, { status: 200 });
	} catch {
		return Response.json({ success: false, message: "Error updating collection" }, { status: 500 });
	}
}

export async function DELETE(request: Request, context: RouteContext) {
	const authResult = await requireAuthenticatedUsername(request);
	if (authResult instanceof Response) {
		return authResult;
	}
	const currentUsername = authResult;

	const parsedParams = collectionIdParamsSchema.safeParse(context.params);
	if (!parsedParams.success) {
		return Response.json({ success: false, message: parsedParams.error.issues[0]?.message ?? "Invalid collection id" }, { status: 400 });
	}

	await dbConnect();

	try {
		const deletedCollection = await BlogCollectionModel.findOneAndDelete({
			_id: parsedParams.data.collectionId,
			ownerUsername: currentUsername,
		});

		if (!deletedCollection) {
			return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
		}

		return Response.json({ success: true, message: "Collection deleted successfully" }, { status: 200 });
	} catch {
		return Response.json({ success: false, message: "Error deleting collection" }, { status: 500 });
	}
}