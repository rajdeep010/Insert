import { uniqueId } from "@/helpers/unique-id";
import { getAuthenticatedAccessToken, requireAuthenticatedUsername } from "@/lib/api/auth";
import { fetchEntityCollaborators, fetchMyCollaborations } from "@/lib/collaboration/permissions";
import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/model/Topic";
import { createTopicSchema } from "@/schemas/topicSchema";

const TOPIC_LIST_SELECT =
    "_id id title about visibility creator_username createdAt";

const attachCollaborators = async (topics: Array<Record<string, any>>, accessToken?: string | null) =>
    Promise.all(
        topics.map(async (topic) => ({
            ...topic,
            collaborators: await fetchEntityCollaborators("TOPIC", String(topic.id ?? ""), accessToken),
        }))
    );

export async function GET(request: Request) {
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;
    const accessToken = await getAuthenticatedAccessToken(request);

    await dbConnect();

    try {
        const collaborations = await fetchMyCollaborations(accessToken, "TOPIC");
        const collaboratorTopicIds = collaborations
            .map((item: { entityId: string }) => item.entityId)
            .filter(Boolean);

        const filter = {
            $or: [
                { visibility: "public" },
                { visibility: "private", creator_username: currentUsername },
                ...(collaboratorTopicIds.length
                    ? [{ visibility: "private", id: { $in: collaboratorTopicIds } }]
                    : []),
            ],
        };

        const topics = await TopicModel.find(filter)
            .sort({ createdAt: -1 })
            .select(TOPIC_LIST_SELECT)
            .lean();

        const topicsWithCollaborators = await attachCollaborators(topics, accessToken);

        return Response.json(
            {
                success: true,
                message: "Topics fetched successfully",
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

export async function POST(request: Request) {
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return Response.json(
            {
                success: false,
                message: "Invalid JSON body",
            },
            { status: 400 }
        );
    }

    const parsedBody = createTopicSchema.safeParse(body);

    if (!parsedBody.success) {
        return Response.json(
            {
                success: false,
                message: parsedBody.error.issues[0]?.message ?? "Invalid request body",
            },
            { status: 400 }
        );
    }

    await dbConnect();

    try {
        const topic = await TopicModel.create({
            id: uniqueId,
            title: parsedBody.data.title,
            about: parsedBody.data.about,
            visibility: parsedBody.data.visibility,
            creator_username: currentUsername,
            collaborators: [],
        });

        return Response.json(
            {
                success: true,
                message: "Topic created successfully",
                topic,
            },
            { status: 201 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error creating topic",
            },
            { status: 500 }
        );
    }
}