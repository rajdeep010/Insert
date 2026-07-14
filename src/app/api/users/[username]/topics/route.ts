import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedAccessToken, getAuthenticatedUsername } from "@/lib/api/auth";
import { fetchMyCollaborations } from "@/lib/collaboration/permissions";
import TopicModel from "@/model/Topic";
import { usernameParamsSchema } from "@/schemas/userSchema";

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
        let collaboratorTopicIds: string[] = [];
        let membershipRoles = new Map<string, TopicAccessRole>();
        
        // Fetch collaborations with timeout
        try {
            const collaborations = await Promise.race([
                fetchMyCollaborations(accessToken, "TOPIC"),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Collaboration fetch timeout')), 5000))
            ]) as Array<{ entityId: string; role: TopicAccessRole }>;
            
            membershipRoles = new Map<string, TopicAccessRole>(
                collaborations.map((item: { entityId: string; role: TopicAccessRole }) => [item.entityId, item.role])
            );
            collaboratorTopicIds = collaborations
                .map((item: { entityId: string }) => item.entityId)
                .filter(Boolean);
        } catch (error) {
            console.warn('Failed to fetch collaborations:', error);
        }

        if (currentUsername === requestedUsername) {
            const [ownedTopics, collaboratedTopics] = await Promise.all([
                TopicModel.find({ creator_username: requestedUsername })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select(TOPIC_SELECT)
                    .lean(),
                collaboratorTopicIds.length
                    ? TopicModel.find({ id: { $in: collaboratorTopicIds } })
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit)
                        .select(TOPIC_SELECT)
                        .lean()
                    : Promise.resolve([]),
            ]);

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

        const [publicTopics, total] = await Promise.all([
            TopicModel.find({
                creator_username: requestedUsername,
                visibility: "public",
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select(TOPIC_SELECT)
                .lean(),
            TopicModel.countDocuments({
                creator_username: requestedUsername,
                visibility: "public",
            }),
        ]);

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