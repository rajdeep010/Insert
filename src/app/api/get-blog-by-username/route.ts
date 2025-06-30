import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog";
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
                message: usernameErrors.length > 0
                    ? usernameErrors.join(', ')
                    : 'Invalid username'
            }, { status: 400 })
        }

        const { username } = result.data
        if (!username) {
            return Response.json({
                success: false,
                message: 'Invalid username',
            }, { status: 404 })
        }

        const getBlogByUsername = await BlogModel.find({ creator: username }).sort({ lastEdited: -1 })

        if (getBlogByUsername.length > 0) {
            return Response.json({
                success: true,
                message: 'Blogs found',
                blog: getBlogByUsername
            }, { status: 200 })
        } else {
            return Response.json({
                success: false,
                message: 'No blogs found for this user',
            }, { status: 404 })
        }

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in finding blogs'
        }, { status: 500 })
    }
}