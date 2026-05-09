import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import { buildPublicUserPayload } from "@/lib/api/user";
import UserModel from "@/model/User";
import { usernameParamsSchema } from "@/schemas/userSchema";

type RouteContext = {
    params: {
        username: string;
    };
};

const PUBLIC_USER_SELECT =
    "_id name username about linkedin profile location company avatar proStatus";

export async function GET(
    request: Request,
    context: RouteContext
) {
    const currentUsername = await getAuthenticatedUsername(request);

    if (!currentUsername) {
        return Response.json(
            {
                success: false,
                message: "Authentication required",
            },
            { status: 401 }
        );
    }

    const parsedParams = usernameParamsSchema.safeParse(context.params);

    if (!parsedParams.success) {
        return Response.json(
            {
                success: false,
                message:
                    parsedParams.error.issues[0]?.message ?? "Invalid username",
            },
            { status: 400 }
        );
    }

    await dbConnect();

    try {
        const user = await UserModel.findOne({
            username: parsedParams.data.username,
        }).select(PUBLIC_USER_SELECT);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "User found",
                userdata: buildPublicUserPayload(user),
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error fetching user",
            },
            { status: 500 }
        );
    }
}