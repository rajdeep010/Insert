import { requireAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import BlogCollectionModel from "@/model/BlogCollection";
import BlogModel from "@/model/Blog";
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
const BLOG_REFERENCE_SELECT = "_id blogTitle blogUrl";
const BLOG_COLLECTION_REFERENCE_SELECT = "_id name";

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

    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

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
        })
            .sort({ createdAt: -1 })
            .lean();

        const blogIds = Array.from(
            new Set(
                problems.flatMap((problem) =>
                    (problem.blogReferences ?? []).map((reference) => String(reference.blogId))
                )
            )
        );

        const collectionIds = Array.from(
            new Set(
                problems.flatMap((problem) =>
                    (problem.blogReferences ?? [])
                        .map((reference) => reference.collectionId)
                        .filter(Boolean)
                        .map((collectionId) => String(collectionId))
                )
            )
        );

        const [blogs, collections] = await Promise.all([
            blogIds.length
                ? BlogModel.find({ _id: { $in: blogIds } }).select(BLOG_REFERENCE_SELECT).lean()
                : Promise.resolve([]),
            collectionIds.length
                ? BlogCollectionModel.find({ _id: { $in: collectionIds } }).select(BLOG_COLLECTION_REFERENCE_SELECT).lean()
                : Promise.resolve([]),
        ]);

        const blogMap = new Map(
            blogs.map((blog) => [String(blog._id), blog])
        );

        const collectionMap = new Map(
            collections.map((collection) => [String(collection._id), collection])
        );

        const enrichedProblems = problems.map((problem) => ({
            ...problem,
            blogReferences: (problem.blogReferences ?? []).map((reference) => {
                const blog = blogMap.get(String(reference.blogId));
                const collection = reference.collectionId
                    ? collectionMap.get(String(reference.collectionId))
                    : undefined;

                return {
                    ...reference,
                    blogId: String(reference.blogId),
                    collectionId: reference.collectionId ? String(reference.collectionId) : null,
                    blogTitle: blog?.blogTitle,
                    blogUrl: blog?.blogUrl,
                    collectionName: collection?.name,
                };
            }),
        }));

        return Response.json(
            {
                success: true,
                message: "Topic fetched successfully",
                topic,
                problems: enrichedProblems,
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
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

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
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

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