import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getToken } from "next-auth/jwt";


export async function POST(request: Request) {
    await dbConnect()
    const token = await getToken({ req: request as any })

    try {
        const { username, notifyid } = await request.json()

        if(username !== token?.username){
            return Response.json({
                success: false,
                message: 'Not authorized',
            }, { status: 400 })
        }

        const user = await UserModel.findOne({ username })

        if (!user) {
            return Response.json({
                success: false,
                message: 'User not found',
            }, { status: 404 })
        }

        const originalNotifications = user.notifications || []
        const updatedNotifications = originalNotifications.filter(
            (notification: any) => notification.id !== notifyid
        )

        if (originalNotifications.length === updatedNotifications.length) {
            return Response.json({
                success: false,
                message: 'Notification not found',
            }, { status: 404 })
        }

        user.notifications = updatedNotifications
        await user.save()

        return Response.json({
            success: true,
            message: 'Notification deleted successfully',
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in deleting notification',
        }, { status: 500 })
    }
}