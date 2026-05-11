import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import BlogCollectionModel from "@/model/BlogCollection";
import BlogModel from "@/model/Blog";
import {
	collectionIdParamsSchema,
	updateCollectionBlogsSchema,
} from "@/schemas/blogCollectionSchema";

type RouteContext = {
	params: {
		collectionId: string;
	};
};

export async function POST(request: Request, context: RouteContext) {
	return updateCollectionBlogs(request, context, "add");
}

export async function DELETE(request: Request, context: RouteContext) {
	return updateCollectionBlogs(request, context, "remove");
}

async function updateCollectionBlogs(
	request: Request,
	context: RouteContext,
	mode: "add" | "remove"
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

	const parsedBody = updateCollectionBlogsSchema.safeParse(body);
	if (!parsedBody.success) {
		return Response.json({ success: false, message: parsedBody.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
	}

	await dbConnect();

	try {
		const collection = await BlogCollectionModel.findOne({
			_id: parsedParams.data.collectionId,
			ownerUsername: currentUsername,
		});

		if (!collection) {
			return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
		}

		const blogFilter = mode === "add"
			? collection.visibility === "public"
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
				}
			: {
				_id: { $in: parsedBody.data.blogIds },
				creator: currentUsername,
			};

		const validBlogs = await BlogModel.find(blogFilter).select("_id");

		if (validBlogs.length !== new Set(parsedBody.data.blogIds).size) {
			return Response.json({ success: false, message: mode === "add" && collection.visibility === "public" ? "Public collections can only include published public blogs" : "One or more blogs are invalid for this collection" }, { status: 400 });
		}

		const nextBlogIds = new Set(collection.blogIds.map((blogId) => blogId.toString()));

		for (const blogId of parsedBody.data.blogIds) {
			if (mode === "add") {
				nextBlogIds.add(blogId);
			} else {
				nextBlogIds.delete(blogId);
			}
		}

		collection.blogIds = Array.from(nextBlogIds) as never;
		await collection.save();

		return Response.json({
			success: true,
			message: mode === "add" ? "Blogs added to collection" : "Blogs removed from collection",
			collection,
		}, { status: 200 });
	} catch {
		return Response.json({ success: false, message: "Error updating collection blogs" }, { status: 500 });
	}
}