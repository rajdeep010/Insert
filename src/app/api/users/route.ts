import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import { buildPublicUserPayload } from "@/lib/api/user";
import UserModel from "@/model/User";

const SEARCH_USER_SELECT =
    "_id name username about linkedin profile location company avatar proStatus";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const usernameQuery = searchParams.get("username")?.trim() ?? "";

    if (!usernameQuery) {
        return Response.json(
            {
                success: false,
                message: "Username query is required",
            },
            { status: 400 }
        );
    }

    await dbConnect();

    try {
        const currentUsername = await getAuthenticatedUsername(request);
        const filters: Array<Record<string, unknown>> = [
            { username: { $regex: usernameQuery, $options: "i" } },
        ];

        if (currentUsername) {
            filters.push({ username: { $ne: currentUsername } });
        }

        const users = await UserModel.find({ $and: filters })
            .select(SEARCH_USER_SELECT)
            .limit(10);

        return Response.json(
            {
                success: true,
                message: users.length > 0 ? "Found" : "No users found",
                users: users.map(buildPublicUserPayload),
                similar_users: users.map(buildPublicUserPayload),
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error finding users",
            },
            { status: 500 }
        );
    }
}