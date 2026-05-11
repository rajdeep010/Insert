import dbConnect from "@/lib/dbConnect";
import { requireAuthenticatedUsername } from "@/lib/api/auth";
import UserModel from "@/model/User";
import { usernameParamsSchema } from "@/schemas/userSchema";

type RouteContext = {
    params: {
        username: string;
    };
};

export async function GET(
    request: Request,
    context: RouteContext
) {
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
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
        }).select("username avatar");

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
                message: "Avatar fetched successfully",
                userdata: {
                    username: user.username,
                    avatar: user.avatar ?? null,
                },
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error fetching avatar",
            },
            { status: 500 }
        );
    }
}