import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicModel from "@/model/Topic";
import TopicPublicOrPrivateModel from "@/model/Topicvisible";
import { topicidValidation,usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const TopicQuerySchema = z.object({
    topicid: topicidValidation,
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)

        const queryParam = {
            topicid: searchParams.get('topicid'),
            username: searchParams.get('username')
        }

        const result = TopicQuerySchema.safeParse(queryParam)
        if (!result.success) {
            const topicQueryErrors = result.error.format().username?._errors || result.error.format().topicid?._errors || []
            return Response.json({
                success: false,
                message: topicQueryErrors?.length > 0
                    ? topicQueryErrors.join(', ')
                    : 'Invalid Query Parameters'
            },{ status: 400 })
        }

        const { topicid, username } = result.data
        const topic = await TopicModel.findOne({ id: topicid });

        if (!topic) {
            return Response.json({
                success: false,
                message: 'Topic not found'
            },{ status: 404 })
        }

        if (topic.visibility === 'public') {
            return Response.json({
                success: true,
                message: 'Authorized access'
            },{ status: 200 });
        }

        const isCreator = topic.creator_username === username;
        const isCollaborator = topic.collaborators.some(
            (collab: any) => collab.username === username
        );

        if (isCreator || isCollaborator) {
            return Response.json(
                {
                    success: true,
                    message: "Authorized access (private topic)",
                },
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: false,
                message: "Unauthorized access to private topic",
            },
            { status: 403 }
        );

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in processing the visibility'
        },{ status: 500 })
    }
}