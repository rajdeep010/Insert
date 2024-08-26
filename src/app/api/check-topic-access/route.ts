import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicPublicOrPrivateModel from "@/model/Topicvisible";
import { topicidValidation, usernameValidation } from "@/schemas/signUpSchema";
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
        if(!result.success)
        {
            const topicQueryErrors = result.error.format().username?._errors || result.error.format().topicid?._errors || []
            return Response.json({
                success: false,
                message: topicQueryErrors?.length > 0
                    ? topicQueryErrors.join(', ')
                    : 'Invalid Query Parameters'
            },{ status: 400 })
        }

        const { topicid, username } = result.data
        const topicInfo = await TopicPublicOrPrivateModel.findOne({ topicid })

        if (!topicInfo) {
            return Response.json({
                success: false,
                message: 'Topic not found'
            }, { status: 404 })
        }

        if (topicInfo.visibility === 'public') {
            return Response.json({
                success: true,
                message: 'Authorized access'
            }, { status: 200 });
        }

        const topicDetails = await AlltopicModel.findOne(
            { username: topicInfo.creator_username, 'topics.id': topicid },
            { 'topics.$': 1 }
        )

        if (!topicDetails || !topicDetails.topics || topicDetails.topics.length === 0) {
            return Response.json({
                success: false,
                message: 'Topic not found'
            }, { status: 404 })
        }

        const topic = topicDetails.topics[0]
        const isPresent = topic.collaborators.find((each: any) => each.username === username )

        if (topic.creator_username === username || isPresent) {
            return Response.json({
                success: true,
                message: 'Authorized access'
            }, { status: 200 })
        }

        return Response.json({
            success: false,
            message: 'Unauthorized access'
        }, { status: 403 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in processing the visibility'
        }, { status: 500 })
    }
}