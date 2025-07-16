import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"
import ProblemModel from "@/model/Problem"
import TopicModel from "@/model/Topic"
import { topicidValidation } from "@/schemas/signUpSchema"
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"
import { z } from "zod"


const TopicQueryValidation = z.object({
    topic_id: topicidValidation
})

export async function GET(request: NextRequest) {
    await dbConnect()
    const token = await getToken({ req: request })

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
        console.log('topic_id: ', topic_id)
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

        if (topic?.creator_username === token?.username || topic?.visibility === "public") {
            const problems = await ProblemModel.find({ topicId: topic._id });
            return Response.json(
                {
                    success: true,
                    message: "Topic and problems fetched successfully",
                    topic,
                    problems,
                },
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: false,
                message: "Topic not found",
            },
            { status: 404 }
        );

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in getting topic by topicid',
        },{ status: 500 })
    }
}