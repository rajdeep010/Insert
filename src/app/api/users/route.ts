import dbConnect from "@/lib/dbConnect";
import { requireAuthenticatedUsername } from "@/lib/api/auth";
import { registerUser } from "@/lib/api/auth-handlers";
import { buildPublicUserPayload } from "@/lib/api/user";
import UserModel from "@/model/User";

const SEARCH_USER_SELECT =
    "_id name username about linkedin profile location company avatar proStatus";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: Request) {
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

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

    try {
        await dbConnect();
        const filters: Array<Record<string, unknown>> = [
            { username: { $regex: escapeRegex(usernameQuery), $options: "i" } },
        ];
        filters.push({ username: { $ne: currentUsername } });

        const matchedUsers = await UserModel.find({ $and: filters })
            .select(SEARCH_USER_SELECT)
            .limit(10);

        const users = matchedUsers.map(buildPublicUserPayload);

        return Response.json(
            {
                success: true,
                message: users.length > 0 ? "Found" : "No users found",
                users,
                similar_users: users,
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        return registerUser(body);
    } catch {
        return Response.json(
            {
                success: false,
                message: "Invalid JSON body",
            },
            { status: 400 }
        );
    }
}