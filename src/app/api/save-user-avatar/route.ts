import dbConnect from "@/lib/dbConnect";
import AvatarModel from "@/model/Avatar";


export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, avatarURL } = await request.json()
        
        if (!username || !avatarURL) {
            return Response.json({
                success: false,
                message: 'Wrong Details',
            }, { status: 400 });
        }

        const user = await AvatarModel.findOne({ username })
        if (user) {
            user.avatarURL = avatarURL
            await user.save()
        } else {
            const newUser = new AvatarModel({ username, avatarURL })
            await newUser.save()
        }

        return Response.json({
            success: true,
            message: 'Avatar updated successfully',
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in updating avatar',
        }, { status: 500 })
    }
}