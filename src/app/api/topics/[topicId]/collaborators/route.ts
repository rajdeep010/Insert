import { getAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/model/Topic";
import {
    addCollaboratorSchema,
    topicIdParamSchema,
} from "@/schemas/topicSchema";

type RouteContext = {
    params: {
        topicId: string;
    };
};

export async function POST(
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

    const parsedTopicParams = topicIdParamSchema.safeParse(context.params);

    if (!parsedTopicParams.success) {
        return Response.json(
            {
                success: false,
                message:
                    parsedTopicParams.error.issues[0]?.message ?? "Invalid topic id",
            },
            { status: 400 }
        );
    }

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

    const parsedBody = addCollaboratorSchema.safeParse(body);

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
        const topic = await TopicModel.findOne({
            id: parsedTopicParams.data.topicId,
        });

        if (!topic) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found",
                },
                { status: 404 }
            );
        }

        if (topic.creator_username !== currentUsername) {
            return Response.json(
                {
                    success: false,
                    message: "You are not allowed to add collaborators to this topic",
                },
                { status: 403 }
            );
        }

        const collaboratorUsername = parsedBody.data.collaborator.username;

        if (collaboratorUsername === topic.creator_username) {
            return Response.json(
                {
                    success: false,
                    message: "Creator cannot be added as collaborator",
                },
                { status: 400 }
            );
        }

        const alreadyExists = topic.collaborators?.some(
            (collaborator: { username: string }) =>
                collaborator.username === collaboratorUsername
        );

        if (alreadyExists) {
            return Response.json(
                {
                    success: false,
                    message: "User is already a collaborator",
                },
                { status: 409 }
            );
        }

        topic.collaborators.push({
            username: parsedBody.data.collaborator.username,
            name: parsedBody.data.collaborator.name || "",
        });

        await topic.save();

        return Response.json(
            {
                success: true,
                message: "Collaborator added successfully",
                topic,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error adding collaborator",
            },
            { status: 500 }
        );
    }
}