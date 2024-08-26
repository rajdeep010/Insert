import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";


const UsernameQueryValidation = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        const {searchParams} = new URL(request.url)
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
        if(!username){
            return Response.json({
                success: false,
                message: 'Invalid username',
            },{ status: 404 })
        }

        const getUserByUsername = await UserModel.findOne({ username }).select('-password -verifyCode -verifyCodeExpiry')
        
        if (getUserByUsername) {
            return Response.json({
                success: true,
                message: 'User found',
                userdata: getUserByUsername
            },{ status: 201 })
        }
        else {
            return Response.json({
                success: false,
                message: 'User not found',
            },{ status: 404 })
        }

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in finding user'
        }, {status: 500})
    }
}