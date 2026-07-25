import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import { buildPublicUserPayload } from "@/lib/api/user";
import UserModel from "@/model/User";

const SEARCH_USER_SELECT =
	"_id name username about linkedin profile location company avatar proStatus";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: Request) {
	const currentUsername = await getAuthenticatedUsername(request);
	if (!currentUsername) {
		return Response.json(
			{
				success: false,
				message: "Authentication required",
				users: [],
			},
			{ status: 401 }
		);
	}

	const { searchParams } = new URL(request.url);
	const query = searchParams.get("query")?.trim() ?? "";

	if (!query) {
		return Response.json(
			{
				success: false,
				message: "Search query is required",
				users: [],
			},
			{ status: 400 }
		);
	}

	try {
		await dbConnect();

		// Use text search with regex as fallback
		let matchedUsers: any[] = [];
		try {
			// Try text search first (faster with text index)
			matchedUsers = await UserModel.find(
				{ $text: { $search: query }, username: { $ne: currentUsername } },
				{ score: { $meta: "textScore" } }
			)
				.select(SEARCH_USER_SELECT)
				.sort({ score: { $meta: "textScore" } })
				.limit(10)
				.lean();
		} catch(error) {
			console.error("Text search failed:", error);
			matchedUsers = [];
		}

		if (matchedUsers.length === 0) {
			matchedUsers = await UserModel.find({
				username: {
					$regex: `^${escapeRegex(query)}`,
					$options: "i",
					$ne: currentUsername,
				},
			})
				.select(SEARCH_USER_SELECT)
				.sort({ username: 1 })
				.limit(10)
				.lean();

			console.log("Regex Search Results:", matchedUsers.length);
		}

		const users = matchedUsers.map(buildPublicUserPayload);

		return Response.json(
			{
				success: true,
				message: users.length > 0 ? "Found" : "No users found",
				users,
			},
			{ status: 200 }
		);
	} catch {
		return Response.json(
			{
				success: false,
				message: "Error finding users",
				users: [],
			},
			{ status: 500 }
		);
	}
}