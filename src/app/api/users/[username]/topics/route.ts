import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedAccessToken, getAuthenticatedUsername } from "@/lib/api/auth";
import TopicModel from "@/model/Topic";
import { usernameParamsSchema } from "@/schemas/userSchema";
import { fetchCollaborationsWithTimeout } from "@/lib/collaboration/fetch-collaborations-with-timeout";

type RouteContext = {
    params: {
        username: string;
    };
};

const TOPIC_SELECT = "_id id title about visibility creator_username createdAt";
type TopicAccessRole = "OWNER" | "EDITOR" | "VIEWER" | null;

const attachAccessRole = (
    topics: Array<Record<string, any>>,
    currentUsername: string,
    membershipRoles: Map<string, TopicAccessRole>
) => topics.map((topic) => ({
    ...topic,
    collaborators: [],
    currentAccessRole:
        String(topic.creator_username ?? "") === currentUsername
            ? "OWNER"
            : membershipRoles.get(String(topic.id ?? "")) ?? (topic.visibility === "public" ? "VIEWER" : null),
}));

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
        // Get pagination parameters
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
        const skip = (page - 1) * limit;

        const accessToken = await getAuthenticatedAccessToken(request);
        const collaborationsPromise = fetchCollaborationsWithTimeout(accessToken, "TOPIC", 1200);

        if (currentUsername === requestedUsername) {
            const [ownedTopics, collaborations] = await Promise.all([
                TopicModel.find({ creator_username: requestedUsername })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select(TOPIC_SELECT)
                    .lean(),
                collaborationsPromise,
            ]);

            const collaboratorTopicIds = collaborations.map((item) => item.entityId).filter(Boolean);
            const membershipRoles = new Map<string, TopicAccessRole>(
                collaborations.map((item) => [item.entityId, item.role])
            );

            const collaboratedTopics = collaboratorTopicIds.length
                ? await TopicModel.find({ id: { $in: collaboratorTopicIds } })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select(TOPIC_SELECT)
                    .lean()
                : [];

            const dedupedTopics = Array.from(
                new Map(
                    [...ownedTopics, ...collaboratedTopics].map((topic) => [String(topic.id), topic])
                ).values()
            ).sort((left: any, right: any) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime());

            const topics = attachAccessRole(dedupedTopics, currentUsername, membershipRoles);

            return Response.json(
                {
                    success: true,
                    message: topics.length ? "Topics found" : "No topics found",
                    topics,
                    pagination: { page, limit },
                },
                { status: 200 }
            );
        }

        const [publicTopics, collaborations, total] = await Promise.all([
            TopicModel.find({
                creator_username: requestedUsername,
                visibility: "public",
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select(TOPIC_SELECT)
                .lean(),
            collaborationsPromise,
            TopicModel.countDocuments({
                creator_username: requestedUsername,
                visibility: "public",
            }),
        ]);

        const membershipRoles = new Map<string, TopicAccessRole>(
            collaborations.map((item) => [item.entityId, item.role])
        );

        const topicsWithCollaborators = attachAccessRole(publicTopics, currentUsername, membershipRoles);
        const totalPages = Math.ceil(total / limit);

        return Response.json(
            {
                success: true,
                message: topicsWithCollaborators.length ? "Topics found" : "No topics found",
                topics: topicsWithCollaborators,
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