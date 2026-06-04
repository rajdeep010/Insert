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

		const filters: Array<Record<string, unknown>> = [
			{ username: { $regex: `^${escapeRegex(query)}`, $options: "i" } },
			{ username: { $ne: currentUsername } },
		];

		const matchedUsers = await UserModel.find({ $and: filters })
			.select(SEARCH_USER_SELECT)
			.sort({ username: 1 })
			.limit(10);

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