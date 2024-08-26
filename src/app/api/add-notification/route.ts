import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export async function POST(request: Request) {
    await dbConnect()
    try {
        const { to_whom, notification } = await request.json()

        const response = await UserModel.findOneAndUpdate(
            { username: to_whom },
            { $push: { notifications: notification } },
            { new: true }
        )

        if (!response) {
            return Response.json({
                success: false,
                message: 'User not found',
            }, { status: 404 })
        }

        return Response.json({
            success: true,
            message: 'Sent notification successfully'
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in sending notification',
        }, { status: 500 })
    }
}