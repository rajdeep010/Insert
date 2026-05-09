import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import TopicModel from "@/model/Topic";
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

    const requestedUsername = parsedParams.data.username;
    const currentUsername = await getAuthenticatedUsername(request);

    if (!currentUsername) {
        return Response.json(
            {
                success: false,
                message: "Authentication required",
                topics: [],
            },
            { status: 401 }
        );
    }

    await dbConnect();

    try {
        const filter =
            currentUsername === requestedUsername
                ? { creator_username: requestedUsername }
                : {
                    $or: [
                        {
                            creator_username: requestedUsername,
                            visibility: "public",
                        },
                        {
                            creator_username: requestedUsername,
                            "collaborators.username": currentUsername,
                        },
                    ],
                };

        const topics = await TopicModel.find(filter)
            .sort({ createdAt: -1 })
            .select(
                "_id id title about visibility creator_username collaborators createdAt"
            );

        return Response.json(
            {
                success: true,
                message: topics.length ? "Topics found" : "No topics found",
                topics,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error fetching topics",
            },
            { status: 500 }
        );
    }
}