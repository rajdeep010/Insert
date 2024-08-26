import dbConnect from "@/lib/dbConnect";
import UserModel, { NotificationData } from "@/model/User";


export async function POST(request: Request) {
    await dbConnect()
    try {
        const { username, notifyid } = await request.json()

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