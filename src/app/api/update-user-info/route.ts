import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getSession } from "next-auth/react";


export async function POST(request: Request) {
    await dbConnect()
    
    try {
        const { username, ...formData } = await request.json()

        const existUserByUsername = await UserModel.findOne({ username })
        if (!existUserByUsername) {
            return Response.json({
                success: false,
                message: 'User not found',
            },{ status: 404 })
        }

        const updateData = {
            ...(formData.name && { name: formData.name }),
            ...(formData.about && { about: formData.about }),
            ...(formData.linkedin && { linkedin: formData.linkedin }),
            ...(formData.profile && { profile: formData.profile }),
            ...(formData.company && { company: formData.company }),
            ...(formData.location && { location: formData.location }),
        }

        const updatedUser = await UserModel.updateOne({username}, {$set: updateData})
        if(updatedUser.modifiedCount === 0){
            return Response.json({
                success: false,
                message: 'Data is same as before'
            }, {status: 400})
        }

        return Response.json({
            success: true,
            message: 'User information updated',
        }, {status: 200})

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in updating user'
        }, {status: 500})
    }
}