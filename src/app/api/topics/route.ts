import { uniqueId } from "@/helpers/unique-id";
import { getAuthenticatedAccessToken, requireAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import { fetchCollaborationsWithTimeout } from "@/lib/collaboration/fetch-collaborations-with-timeout";
import TopicModel from "@/model/Topic";
import { createTopicSchema } from "@/schemas/topicSchema";

const TOPIC_LIST_SELECT =
    "_id id title about visibility creator_username createdAt";
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

export async function GET(request: Request) {
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;
    const accessToken = await getAuthenticatedAccessToken(request);

    await dbConnect();

    try {
        // Get pagination parameters
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
        const skip = (page - 1) * limit;

        const collaborationsPromise = fetchCollaborationsWithTimeout(accessToken, "TOPIC", 1200);

        const collaborations = await collaborationsPromise;
        const collaboratorTopicIds = collaborations.map((item) => item.entityId).filter(Boolean);
        const membershipRoles = new Map<string, TopicAccessRole>(
            collaborations.map((item) => [item.entityId, item.role])
        );

        const filter = {
            $or: [
                { visibility: "public" },
                { visibility: "private", creator_username: currentUsername },
                ...(collaboratorTopicIds.length
                    ? [{ visibility: "private", id: { $in: collaboratorTopicIds } }]
                    : []),
            ],
        };

        const [topics, total] = await Promise.all([
            TopicModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select(TOPIC_LIST_SELECT)
                .lean(),
            TopicModel.countDocuments(filter),
        ]);

        const topicsWithCollaborators = attachAccessRole(topics, currentUsername, membershipRoles);
        const totalPages = Math.ceil(total / limit);

        return Response.json(
            {
                success: true,
                message: "Topics fetched successfully",
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
    } catch (error) {
        console.error('Error fetching topics:', error);
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