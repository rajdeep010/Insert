import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { emailValidation } from "@/schemas/signUpSchema";
import { z } from "zod";


const EmailQueryValidation = z.object({
    email: emailValidation
})

export async function GET(request: Request) {
    await dbConnect()
    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            email: searchParams.get('email')
        }
        const result = EmailQueryValidation.safeParse(queryParam)
        if (!result.success) {
            const emailErrors = result.error.format().email?._errors || []
            return Response.json({
                success: false,
                message: emailErrors?.length > 0
                    ? emailErrors.join(', ')
                    : 'Invalid Email'
            }, { status: 400 })
        }
        
        const { email } = result.data
        const getUserByEmail = await UserModel.findOne({ email })
        
        if (getUserByEmail) {
            return Response.json({
                success: true,
                message: 'User found',
                userdata: {
                    username: getUserByEmail.username,
                    email: getUserByEmail.email,
                    isVerified: getUserByEmail.isVerified,
                    profile: getUserByEmail.profile,
                    linkedin: getUserByEmail.linkedin,
                    about: getUserByEmail.about,
                    location: getUserByEmail.location,
                }
            }, { status: 201 })
        }
        else {
            return Response.json({
                success: false,
                message: 'User not found',
            }, { status: 404 })
        }
    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in Sign in'
        }, { status: 500 })
    }
}