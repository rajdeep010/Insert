import dbConnect from "@/lib/dbConnect";
import AvatarModel from "@/model/Avatar";
import UserModel from "@/model/User";
import { getToken } from "next-auth/jwt";


export async function POST(request: Request) {
    await dbConnect()
    const token = await getToken({ req: request as any })

    try {
        const { avatarURL } = await request.json()
        const username = token?.username
        
        if (!username || !avatarURL) {
            return Response.json({
                success: false,
                message: 'Wrong Details',
            }, { status: 400 });
        }

        const avatarPromise = AvatarModel.findOneAndUpdate(
            { username },
            { $set: { avatarURL } },
            { upsert: true, new: true }
        );

        // Update UserModel avatar field
        const userPromise = UserModel.findOneAndUpdate(
            { username },
            { $set: { avatar: avatarURL } },
            { new: true }
        );

        // Run both in parallel
        const [avatarResult, userResult] = await Promise.all([avatarPromise, userPromise]);

        if (!userResult) {
            return Response.json({
                success: false,
                message: 'User not found',
            }, { status: 404 })
        }

        return Response.json({
            success: true,
            message: 'Avatar updated successfully',
            avatar: userResult?.avatar
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in updating avatar',
        }, { status: 500 })
    }
}