import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
        const username = searchParams.get('username')

        const users = await UserModel.find({
            username: { $regex: username, $options: 'i' }
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