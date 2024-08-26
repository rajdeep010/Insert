import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"
import { topicidValidation } from "@/schemas/signUpSchema"
import { z } from "zod"


const TopicQueryValidation = z.object({
    topic_id: topicidValidation
})

export async function GET(request: Request) {
    await dbConnect()
    
    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            topic_id: searchParams.get('topic_id')
        }

        const result = TopicQueryValidation.safeParse(queryParam)
        if (!result.success) {
            const usernameErrors = result.error.format().topic_id?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                    ? usernameErrors.join(', ')
                    : 'Invalid topicid'
            },{ status: 400 })
        }

        const { topic_id } = result.data
        if(!topic_id){
            return Response.json({
                success: false,
                message: 'Invalid topic id',
            },{ status: 404 })
        }

        const userWithTopic = await AlltopicModel.findOne({
            "topics.id": topic_id
        })

        // console.log(userWithTopic)

        if (!userWithTopic) {
            return Response.json({
                success: false,
                message: 'User not found',
            }, {status: 404})
        }

        // Find the specific topic
        const topic = userWithTopic.topics.find((t: any) => t.id === topic_id);
        // console.log(topic)

        return Response.json({
            success: true,
            message: 'Topic found',
            curr_topic: topic
        }, {status: 200})

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in deleteing topic',
        }, { status: 500 })
    }
}