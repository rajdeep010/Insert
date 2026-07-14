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
        
        let matchedUsers;
        try {
            // Use text search first (faster with text index)
            matchedUsers = await UserModel.find(
                { 
                    $text: { $search: usernameQuery },
                    username: { $ne: currentUsername }
                },
                { score: { $meta: "textScore" } }
            )
                .select(SEARCH_USER_SELECT)
                .sort({ score: { $meta: "textScore" } })
                .limit(10)
                .lean();
        } catch {
            // Fallback to prefix match with regex
            matchedUsers = await UserModel.find({
                $and: [
                    { username: { $regex: escapeRegex(usernameQuery), $options: "i" } },
                    { username: { $ne: currentUsername } },
                ],
            })
                .select(SEARCH_USER_SELECT)
                .limit(10)
                .lean();
        }

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
    } catch (error) {
        console.error('Error finding users:', error);
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