import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedAccessToken, getAuthenticatedUsername } from "@/lib/api/auth";
import { fetchEntityCollaborators, fetchMyCollaborations } from "@/lib/collaboration/permissions";
import TopicModel from "@/model/Topic";
import { usernameParamsSchema } from "@/schemas/userSchema";

type RouteContext = {
    params: {
        username: string;
    };
};

const TOPIC_SELECT = "_id id title about visibility creator_username createdAt";

const attachCollaborators = async (topics: Array<Record<string, any>>, accessToken?: string | null) =>
    Promise.all(
        topics.map(async (topic) => ({
            ...topic,
            collaborators: await fetchEntityCollaborators("TOPIC", String(topic.id ?? ""), accessToken),
        }))
    );

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
        const accessToken = await getAuthenticatedAccessToken(request);

        if (currentUsername === requestedUsername) {
            const collaborations = await fetchMyCollaborations(accessToken, "TOPIC");
            const collaboratorTopicIds = collaborations
                .map((item: { entityId: string }) => item.entityId)
                .filter(Boolean);

            const [ownedTopics, collaboratedTopics] = await Promise.all([
                TopicModel.find({ creator_username: requestedUsername })
                    .sort({ createdAt: -1 })
                    .select(TOPIC_SELECT)
                    .lean(),
                collaboratorTopicIds.length
                    ? TopicModel.find({ id: { $in: collaboratorTopicIds } }).select(TOPIC_SELECT).lean()
                    : Promise.resolve([]),
            ]);

            const dedupedTopics = Array.from(
                new Map(
                    [...ownedTopics, ...collaboratedTopics].map((topic) => [String(topic.id), topic])
                ).values()
            ).sort((left: any, right: any) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime());

            const topics = await attachCollaborators(dedupedTopics, accessToken);

            return Response.json(
                {
                    success: true,
                    message: topics.length ? "Topics found" : "No topics found",
                    topics,
                },
                { status: 200 }
            );
        }

        const topics = await TopicModel.find({
            creator_username: requestedUsername,
            visibility: "public",
        })
            .sort({ createdAt: -1 })
            .select(TOPIC_SELECT)
            .lean();

        const topicsWithCollaborators = await attachCollaborators(topics, accessToken);

        return Response.json(
            {
                success: true,
                message: topicsWithCollaborators.length ? "Topics found" : "No topics found",
                topics: topicsWithCollaborators,
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