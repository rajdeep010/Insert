import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import { topicidValidation, usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";


const CheckCollabQuerySchema = z.object({
    creator_username: usernameValidation,
    topicid: topicidValidation,
    check_whom: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)

        const queryParam = {
            creator_username: searchParams.get('creator_username'),
            topicid: searchParams.get('topicid'),
            check_whom: searchParams.get('check_whom')
        }

        const result = CheckCollabQuerySchema.safeParse(queryParam)
        if(!result.success)
        {
            const checkCollabErrors = result.error.format().creator_username?._errors || 
            result.error.format().topicid?._errors || result.error.format().check_whom?._errors || []
            return Response.json({
                success: false,
                message: checkCollabErrors?.length > 0
                    ? checkCollabErrors.join(', ')
                    : 'Invalid Query Parameters'
            },{ status: 400 })
        }

        const { creator_username, topicid, check_whom } = result.data
        console.log(creator_username, topicid, check_whom)

        const topicdata = await AlltopicModel.findOne({
            username: creator_username,
            "topics.id": topicid
        });

        if (!topicdata) {
            return Response.json({
                success: false,
                message: 'User not found'
            }, { status: 404 })
        }

        const topic = topicdata.topics.find((t: any) => t.id === topicid)

        if (!topic) {
            return Response.json({
                success: false,
                message: 'Topic not found'
            }, { status: 200 })
        }

        const all_collabs = topic.collaborators
        const isCollaborator = all_collabs.find((each: any) => each.username === check_whom)

        if (isCollaborator) {
            return Response.json({
                success: false,
                message: 'User is already a collaborator'
            }, { status: 400 })

        } else {
             return Response.json({
                success: true,
                message: 'User is not a collaborator'
            }, { status: 200 })
        }

    } catch (error) {

        console.log(error)

         return Response.json({
            success: false,
            message: 'Error in checking'
        }, { status: 500 })
    }
}
