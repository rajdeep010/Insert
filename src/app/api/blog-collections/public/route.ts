import dbConnect from "@/lib/dbConnect";
import { requireAuthenticatedUsername } from "@/lib/api/auth";
import BlogCollectionModel from "@/model/BlogCollection";
import BlogModel from "@/model/Blog";

const COLLECTION_LIST_SELECT = "_id name description ownerUsername visibility linkedTopicId blogIds createdAt updatedAt";

export async function GET(request: Request) {
	const authResult = await requireAuthenticatedUsername(request);
	if (authResult instanceof Response) {
		return authResult;
	}
	const currentUsername = authResult;

	await dbConnect();

	try {
		// Get pagination parameters
		const url = new URL(request.url);
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
		const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
		const skip = (page - 1) * limit;

		const collectionFilter = {
			$or: [
				{ visibility: "public" },
				{ ownerUsername: currentUsername },
			],
		};

		const [collections, total] = await Promise.all([
			BlogCollectionModel.find(collectionFilter)
				.sort({ updatedAt: -1, createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.select(COLLECTION_LIST_SELECT)
				.lean(),
			BlogCollectionModel.countDocuments(collectionFilter),
		]);

		const allBlogIds = Array.from(new Set(collections.flatMap((collection) => collection.blogIds.map((blogId) => String(blogId)))));
		
		const collectionBlogs = allBlogIds.length > 0
			? await BlogModel.find({
				_id: { $in: allBlogIds },
			}).select("_id creator type status").lean()
			: [];

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

		const totalPages = Math.ceil(total / limit);

		return Response.json(
			{
				success: true,
				message: "Collections fetched successfully",
				collections: hydratedCollections,
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