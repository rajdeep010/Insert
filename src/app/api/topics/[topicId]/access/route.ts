import { getAuthenticatedAccessToken, requireAuthenticatedUsername } from "@/lib/api/auth";
import { resolveEntityPermissions } from "@/lib/collaboration/permissions";
import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/model/Topic";
import { topicIdParamSchema } from "@/schemas/topicSchema";

type RouteContext = {
    params: {
        topicId: string;
    };
};

export async function GET(
    request: Request,
    context: RouteContext
) {
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

    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

    await dbConnect();

    try {
        const topic = await TopicModel.findOne({
            id: parsedTopicParams.data.topicId,
        }).select("_id id visibility creator_username");

        if (!topic) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found",
                },
                { status: 404 }
            );
        }

        const accessToken = await getAuthenticatedAccessToken(request);
        const permissions = await resolveEntityPermissions({
            entityType: "TOPIC",
            entityId: parsedTopicParams.data.topicId,
            visibility: topic.visibility,
            ownerUsername: topic.creator_username,
            currentUsername,
            accessToken,
        });

        if (!permissions.canView) {
            return Response.json(
                {
                    success: false,
                    message: "Unauthorized access to topic",
                    hasAccess: false,
                },
                { status: 403 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Authorized access",
                hasAccess: permissions.canView,
                visibility: topic.visibility,
                isOwner: permissions.isOwner,
                isCollaborator: permissions.isCollaborator,
                canEdit: permissions.canEdit,
                canManageCollaborators: permissions.canManageCollaborators,
                role: permissions.role,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error checking topic access",
            },
            { status: 500 }
        );
    }
}