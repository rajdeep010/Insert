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
        if (!username) {
            return Response.json({
                success: false,
                message: 'Invalid username',
            },{ status: 404 })
        }

        const token = await getToken({ req: request as any })
        const tokenUsername = token?.username

        const getUserByUsername = await UserModel.findOne({ username }).select('-password -verifyCode -verifyCodeExpiry')

        if (getUserByUsername) {
            const userObj = getUserByUsername.toObject();

            // Always send public fields
            const publicFields = {
                name: userObj.name,
                about: userObj.about,
                linkedin: userObj.linkedin,
                profile: userObj.profile,
                location: userObj.location,
                company: userObj.company,
                username: userObj.username,
                avatar: userObj.avatar,
                proStatus: userObj?.proStatus,
            };

            // If token user matches, add private fields
            if (tokenUsername && tokenUsername === userObj.username) {
                Object.assign(publicFields,{
                    email: userObj.email,
                    isVerified: userObj.isVerified,
                    notifications: userObj.notifications,
                });
            }

            return Response.json({
                success: true,
                message: 'User found',
                userdata: publicFields,
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
        },{ status: 500 })
    }
}