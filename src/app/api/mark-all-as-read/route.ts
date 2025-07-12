import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getToken } from "next-auth/jwt";


export async function POST(request: Request) {
    await dbConnect()
    const token = await getToken({ req: request as any });

    try {
        const username = token?.username
        const response = await UserModel.findOneAndUpdate(
            { username },
            { $set: { "notifications.$[].read": true } }, // set all to true
            { new: true }
        )

        if (!response) {
            return Response.json({
                success: false,
                message: 'User not found',
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: 'Marked all as read',
            notifications: response.notifications
        }, { status: 201 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Mark all as read failed'
        }, {status: 500})
    }
}