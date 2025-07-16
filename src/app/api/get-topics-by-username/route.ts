import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicModel from "@/model/Topic";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";


const UsernameQueryValidation = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }

        const result = UsernameQueryValidation.safeParse(queryParam)
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                    ? usernameErrors.join(', ')
                    : 'Invalid username'
            },{ status: 400 })
        }

        const { username } = result.data
        const topics = await TopicModel.find({ creator_username: username }).sort({ createdAt: -1,});

        if (!topics || topics.length === 0) {
            return Response.json({
                success: true,
                message: 'No topics found',
                topics: []
            },{ status: 200 })
        }

        return Response.json(
            {
                success: true,
                message: "Topics found",
                topics,
            },
            { status: 200 }
        );

    } catch (error) {
        return Response.json({
            success: true,
            message: 'Error in finding topic'
        },{ status: 500 })
    }
}