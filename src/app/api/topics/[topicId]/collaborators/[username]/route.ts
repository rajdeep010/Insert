import { getAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/model/Topic";
import { topicIdParamSchema } from "@/schemas/topicSchema";
import { usernameParamsSchema } from "@/schemas/userSchema";

type RouteContext = {
    params: {
        topicId: string;
        username: string;
    };
};

export async function DELETE(
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

    const parsedTopicParams = topicIdParamSchema.safeParse({
        topicId: context.params.topicId,
    });

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

    const parsedUsernameParams = usernameParamsSchema.safeParse({
        username: context.params.username,
    });

    if (!parsedUsernameParams.success) {
        return Response.json(
            {
                success: false,
                message:
                    parsedUsernameParams.error.issues[0]?.message ?? "Invalid username",
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
                    message: "You are not allowed to remove collaborators from this topic",
                },
                { status: 403 }
            );
        }

        const collaboratorUsername = parsedUsernameParams.data.username;

        if (collaboratorUsername === topic.creator_username) {
            return Response.json(
                {
                    success: false,
                    message: "Creator cannot be removed as collaborator",
                },
                { status: 400 }
            );
        }

        const exists = topic.collaborators?.some(
            (collaborator: { username: string }) =>
                collaborator.username === collaboratorUsername
        );

        if (!exists) {
            return Response.json(
                {
                    success: false,
                    message: "Collaborator not found",
                },
                { status: 404 }
            );
        }

        topic.collaborators = topic.collaborators.filter(
            (collaborator: { username: string }) =>
                collaborator.username !== collaboratorUsername
        );

        await topic.save();

        return Response.json(
            {
                success: true,
                message: "Collaborator removed successfully",
                topic,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error removing collaborator",
            },
            { status: 500 }
        );
    }
}