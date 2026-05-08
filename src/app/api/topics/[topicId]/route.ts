import { getAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import ProblemModel from "@/model/Problem";
import TopicModel from "@/model/Topic";
import {
    topicIdParamSchema,
    updateTopicSchema,
} from "@/schemas/topicSchema";

type RouteContext = {
    params: {
        topicId: string;
    };
};

const TOPIC_SELECT =
    "_id id title about visibility creator_username collaborators createdAt";

export async function GET(
    request: Request,
    context: RouteContext
) {
    const parsedParams = topicIdParamSchema.safeParse(context.params);

    if (!parsedParams.success) {
        return Response.json(
            {
                success: false,
                message: parsedParams.error.issues[0]?.message ?? "Invalid topic id",
            },
            { status: 400 }
        );
    }

    const currentUsername = await getAuthenticatedUsername(request);

    await dbConnect();

    try {
        const topic = await TopicModel.findOne({
            id: parsedParams.data.topicId,
        }).select(TOPIC_SELECT);

        if (!topic) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found",
                },
                { status: 404 }
            );
        }

        const isAuthorized =
            topic.visibility === "public" ||
            topic.creator_username === currentUsername ||
            topic.collaborators?.some(
                (collaborator: { username: string }) =>
                    collaborator.username === currentUsername
            );

        if (!isAuthorized) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found",
                },
                { status: 404 }
            );
        }

        const problems = await ProblemModel.find({
            topicId: topic._id,
        }).sort({ createdAt: -1 });

        return Response.json(
            {
                success: true,
                message: "Topic fetched successfully",
                topic,
                problems,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error fetching topic",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
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

    const parsedParams = topicIdParamSchema.safeParse(context.params);

    if (!parsedParams.success) {
        return Response.json(
            {
                success: false,
                message: parsedParams.error.issues[0]?.message ?? "Invalid topic id",
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

    const parsedBody = updateTopicSchema.safeParse(body);

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
        const existingTopic = await TopicModel.findOne({
            id: parsedParams.data.topicId,
        });

        if (!existingTopic) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found",
                },
                { status: 404 }
            );
        }

        if (existingTopic.creator_username !== currentUsername) {
            return Response.json(
                {
                    success: false,
                    message: "You are not allowed to update this topic",
                },
                { status: 403 }
            );
        }

        const updatedTopic = await TopicModel.findOneAndUpdate(
            { id: parsedParams.data.topicId },
            {
                $set: parsedBody.data,
            },
            { new: true, runValidators: true }
        ).select(TOPIC_SELECT);

        return Response.json(
            {
                success: true,
                message: "Topic updated successfully",
                topic: updatedTopic,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error updating topic",
            },
            { status: 500 }
        );
    }
}

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

    const parsedParams = topicIdParamSchema.safeParse(context.params);

    if (!parsedParams.success) {
        return Response.json(
            {
                success: false,
                message: parsedParams.error.issues[0]?.message ?? "Invalid topic id",
            },
            { status: 400 }
        );
    }

    await dbConnect();

    try {
        const existingTopic = await TopicModel.findOne({
            id: parsedParams.data.topicId,
        });

        if (!existingTopic) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found",
                },
                { status: 404 }
            );
        }

        if (existingTopic.creator_username !== currentUsername) {
            return Response.json(
                {
                    success: false,
                    message: "You are not allowed to delete this topic",
                },
                { status: 403 }
            );
        }

        await ProblemModel.deleteMany({ topicId: existingTopic._id });
        await TopicModel.deleteOne({ _id: existingTopic._id });

        return Response.json(
            {
                success: true,
                message: "Topic deleted successfully",
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error deleting topic",
            },
            { status: 500 }
        );
    }
}