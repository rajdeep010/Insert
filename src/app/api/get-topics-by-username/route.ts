import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
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
        // console.log('get topics by username', username)

        const response = await AlltopicModel.findOne({username})
        // console.log(response)

        if(!response){
            return Response.json({
                success: false,
                message: 'No topics found'
            }, {status: 404})
        }

        return Response.json({
            success: true,
            message: 'Topics found',
            topics: response.topics
        }, {status: 201})

    } catch (error) {
        return Response.json({
            success: true,
            message: 'Error in finding topic'
        }, {status: 500})
    }
}