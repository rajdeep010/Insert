import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";


// const UsernameQuerySchema = z.object({
//     username: usernameValidation
// })

export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
        // const queryParam = {
        //     username: searchParams.get('username')
        // }

        const username = searchParams.get('username')

        // console.log(queryParam.username)

        // const result = UsernameQuerySchema.safeParse(queryParam)
        // if (!result.success) {
        //     const usernameErrors = result.error.format().username?._errors || []
        //     return Response.json({
        //         success: false,
        //         message: usernameErrors?.length > 0
        //             ? usernameErrors.join(', ')
        //             : 'Invalid Query Parameters'
        //     }, { status: 400 })
        // }

        // const { username } = result.data
        const users = await UserModel.find({
            username: { $regex: username, $options: 'i' } // 'i' for case-insensitive search
        })

        return Response.json({
            success: true,
            message: 'Found',
            similar_users: users
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in finding collaborators'
        }, { status: 500 })
    }
}