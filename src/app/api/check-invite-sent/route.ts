import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { topicidValidation, usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";


const CheckCollabQuerySchema = z.object({
    from: usernameValidation,
    topicid: topicidValidation,
    username: usernameValidation
})


export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)

        const queryParam = {
            from: searchParams.get('from'),
            topicid: searchParams.get('topicid'),
            username: searchParams.get('username')
        }

        const result = CheckCollabQuerySchema.safeParse(queryParam)
        if(!result.success)
        {
            const checkCollabErrors = result.error.format().from?._errors || 
            result.error.format().topicid?._errors || result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: checkCollabErrors?.length > 0
                    ? checkCollabErrors.join(', ')
                    : 'Invalid Query Parameters'
            },{ status: 400 })
        }

        const { from, topicid, username } = result.data

        const userData = await UserModel.findOne({username})

        if(!userData){
            return Response.json({
                success: false,
                message: 'User not found',
            }, {status: 404})
        }

        const userNotifications = userData.notifications
        const isPresent = userNotifications.find((each) => each.from === from && each.topicid === topicid && each.noti_type === 'collab_invitation')
        if(isPresent){
            return Response.json({
                success: false,
                message: 'Collab invite already sent',
            }, {status: 400})
        }
        else{
            return Response.json({
                success: true,
                message: 'Collab invite has not sent yet'
            }, {status: 200})
        }

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in checking invite notification'
        }, {status: 500})
    }
}