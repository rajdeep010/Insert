import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export async function POST(request: Request) {
    await dbConnect()

    try {
        const {username} = await request.json()
        
        const user = await UserModel.findOne({username})
        if(!user){
            return Response.json({
                success: false,
                message: 'User not found',
            }, {status: 404})
        }

        const userNoties = user.notifications
        userNoties.map((each) => each.read = false)

        await user.save()

        return Response.json({
            success: true,
            message: 'Marked all as read',
            notifications: userNoties
        }, {status: 201})

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Mark all as read failed'
        }, {status: 500})
    }
}