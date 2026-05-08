import { getAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import ProblemModel from "@/model/Problem";
import TopicModel from "@/model/Topic";
import {
    createProblemSchema,
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

    const parsedBody = createProblemSchema.safeParse(body);

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
            id: parsedParams.data.topicId,
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

        const isAllowed =
            topic.creator_username === currentUsername ||
            topic.collaborators?.some(
                (collaborator: { username: string }) =>
                    collaborator.username === currentUsername
            );

        if (!isAllowed) {
            return Response.json(
                {
                    success: false,
                    message: "You are not allowed to add problems to this topic",
                },
                { status: 403 }
            );
        }

        const newProblem = await ProblemModel.create({
            topicId: topic._id,
            qname: parsedBody.data.question.qname,
            url: parsedBody.data.question.url,
            difficulty: parsedBody.data.question.difficulty,
        });

        return Response.json(
            {
                success: true,
                message: "Problem created successfully",
                problem: newProblem,
            },
            { status: 201 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error creating problem",
            },
            { status: 500 }
        );
    }
}