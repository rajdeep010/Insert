import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"
import Problem from "@/model/Problem"
import TopicModel from "@/model/Topic"
import { topicidValidation } from "@/schemas/signUpSchema"
import { z } from "zod"


const TopicQueryValidation = z.object({
    topic_id: topicidValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
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
        if (!topic_id) {
            return Response.json({
                success: false,
                message: 'Invalid topic id',
            },{ status: 404 })
        }

        const topic = await TopicModel.findOne({ id: topic_id });
        if (!topic) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found",
                },
                { status: 404 }
            );
        }

        const problems = await Problem.find({ topicId: topic._id });
        return Response.json(
            {
                success: true,
                message: "Topic and problems fetched successfully",
                topic,
                problems,
            },
            { status: 200 }
        );

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in getting topic by topicid',
        },{ status: 500 })
    }
}