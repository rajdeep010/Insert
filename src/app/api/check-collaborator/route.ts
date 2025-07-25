import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicModel from "@/model/Topic";
import { topicidValidation,usernameValidation } from "@/schemas/signUpSchema";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { z } from "zod";


const CheckCollabQuerySchema = z.object({
    topicid: topicidValidation,
    check_whom: usernameValidation
})

export async function GET(request: NextRequest) {
    await dbConnect()
    const token = await getToken({ req: request })

    try {
        const { searchParams } = new URL(request.url)

        const queryParam = {
            topicid: searchParams.get('topicid'),
            check_whom: searchParams.get('check_whom')
        }

        const result = CheckCollabQuerySchema.safeParse(queryParam)
        if (!result.success) {
            const checkCollabErrors = result.error.format().topicid?._errors || result.error.format().check_whom?._errors || []
            return Response.json({
                success: false,
                message: checkCollabErrors?.length > 0
                    ? checkCollabErrors.join(', ')
                    : 'Invalid Query Parameters'
            },{ status: 400 })
        }

        const { topicid, check_whom } = result.data
        const topic = await TopicModel.findOne({ id: topicid })

        if (!topic || topic?.creator_username !== token?.username) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found"
                },
                { status: 404 }
            )
        }

        const isCollaborator = topic.collaborators?.some(
            (c: any) => c.username === check_whom
        )

        if (isCollaborator) {
            return Response.json(
                {
                    success: false,
                    message: "User is already a collaborator"
                },
                { status: 400 }
            )
        } else {
            return Response.json(
                {
                    success: true,
                    message: "User is not a collaborator"
                },
                { status: 200 }
            )
        }

    } catch (error) {

        // console.log(error)

        return Response.json({
            success: false,
            message: 'Error in checking'
        },{ status: 500 })
    }
}
