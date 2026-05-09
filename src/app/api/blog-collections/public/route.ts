import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import BlogCollectionModel from "@/model/BlogCollection";
import BlogModel from "@/model/Blog";

const COLLECTION_LIST_SELECT = "_id name description ownerUsername visibility linkedTopicId blogIds createdAt updatedAt";

export async function GET(request: Request) {
	const currentUsername = await getAuthenticatedUsername(request);

	await dbConnect();

	try {
		const collectionFilter = currentUsername
			? {
				$or: [
					{ visibility: "public" },
					{ ownerUsername: currentUsername },
				],
			}
			: { visibility: "public" };

		const collections = await BlogCollectionModel.find(collectionFilter)
			.sort({ updatedAt: -1, createdAt: -1 })
			.select(COLLECTION_LIST_SELECT)
			.lean();

		const allBlogIds = Array.from(new Set(collections.flatMap((collection) => collection.blogIds.map((blogId) => String(blogId)))));
		const collectionBlogs = await BlogModel.find({
			_id: { $in: allBlogIds },
			autosave: { $ne: true },
		}).select("_id creator type status").lean();

		const blogMap = new Map(collectionBlogs.map((blog) => [String(blog._id), blog]));
		const hydratedCollections = collections
			.map((collection) => {
				const isOwner = collection.ownerUsername === currentUsername;
				const visibleBlogCount = collection.blogIds.filter((blogId) => {
					const blog = blogMap.get(String(blogId));
					if (!blog) return false;
					if (isOwner) {
						return blog.creator === currentUsername;
					}
					return blog.status === "active" && blog.type === "public";
				}).length;

				return {
					...collection,
					visibleBlogCount,
				};
			})
			.filter((collection) => {
				if (collection.ownerUsername === currentUsername) {
					return true;
				}

				return collection.blogIds.length === 0 || collection.visibleBlogCount > 0;
			});

		return Response.json({ success: true, message: "Collections fetched successfully", collections: hydratedCollections }, { status: 200 });
	} catch {
		return Response.json({ success: false, message: "Error fetching collections" }, { status: 500 });
	}
}