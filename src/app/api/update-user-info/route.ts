import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";


export async function POST(request: Request) {
    await dbConnect()
    const token = await getToken({ req: request as any })
    
    try {
        const { ...formData } = await request.json()
        const username = token?.username

        const existUserByUsername = await UserModel.findOne({ username })
        if (!existUserByUsername) {
            return Response.json({
                success: false,
                message: 'User not found',
            },{ status: 404 })
        }

        const updateData: Record<string, any> = {}
        Object.keys(formData).forEach(key => {
            updateData[key] = formData[key]
        })

        const updatedUser = await UserModel.updateOne({ username }, { $set: updateData })
        if (updatedUser.modifiedCount === 0) {
            return Response.json({
                success: false,
                message: 'Data is same as before'
            }, { status: 400 })
        }

        return Response.json({
            success: true,
            message: 'User information updated',
            userdata: updatedUser
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in updating user'
        }, {status: 500})
    }
}