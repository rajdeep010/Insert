import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicModel from "@/model/Topic";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";



export async function POST(request: NextRequest) {
    await dbConnect()
    const token = await getToken({ req: request })

    try {
        const { add_whom_username,add_whom_name,topicid } = await request.json()

        const topic = await TopicModel.findOne({ id: topicid })
        if (!topic) {
            return Response.json({
                success: false,
                message: "Topic not found"
            },{ status: 404 })
        }

        if (topic?.creator_username !== token?.username) {
            return Response.json({
                success: false,
                message: "Forbidden to add",
            },{ status: 403 })
        }

        const alreadyExists = topic.collaborators?.some(
            (collab: any) => collab.username === add_whom_username
        )

        if (alreadyExists) {
            return Response.json({
                success: false,
                message: "User is already a collaborator"
            },{ status: 400 })
        }

        topic.collaborators.push({
            username: add_whom_username,
            name: add_whom_name
        })

        await topic.save()

        return Response.json({
            success: true,
            message: "Added as collaborator",
            topic
        },{ status: 200 })

    } catch (error) {
        // console.log(error)
        return Response.json({
            success: false,
            message: 'Error in adding collaborator',
        },{ status: 500 })
    }
}