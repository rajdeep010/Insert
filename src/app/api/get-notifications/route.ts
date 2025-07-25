import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { getToken } from "next-auth/jwt";
import { z } from "zod";


const UsernameQueryValidation = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()
    const token = await getToken({ req: request as any })

    try {
        const username = token?.username

        const user = await UserModel.findOne({username})
        if(!user){
            return Response.json({
                success: false,
                message: 'User not found'
            }, {status: 404})
        }

        return Response.json({
            success: true,
            message: 'Notifications found',
            notifications: user.notifications
        })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in getting notifications'
        }, {status: 500})
    }
}