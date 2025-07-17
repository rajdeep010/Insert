import { uniqueId } from "@/helpers/unique-id";
import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicModel from "@/model/Topic";
import TopicPublicOrPrivateModel from "@/model/Topicvisible";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
    await dbConnect()
    const token = await getToken({ req: request })

    try {
        if (!token) {
            return Response.json({
                success: false,
                message: 'Authentication required',
            },{ status: 401 })
        }

        const { topic } = await request.json();
        
        const newtopicid = uniqueId
        const newItem = new TopicModel({
            id: newtopicid,
            title: topic.title,
            about: topic.about,
            visibility: topic.visibility,
            problems: topic.problems || [],
            creator_username: token?.username,
            collaborators: topic.collaborators || []
        })

        const savedTopic = await newItem.save()

        return Response.json({
            success: true,
            message: 'Adding topic done',
            topic: savedTopic
        },{ status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in adding topic'
        },{ status: 500 })
    }
}
