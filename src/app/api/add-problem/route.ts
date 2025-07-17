import { uniqueId } from "@/helpers/unique-id"
import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"
import ProblemModel from "@/model/Problem"
import TopicModel from "@/model/Topic"
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"



export async function POST(request: NextRequest) {
    await dbConnect()
    const token = await getToken({ req: request })

    try {
        const username = token?.username;
        if (!username) {
            return Response.json(
                { success: false,message: "Authentication required" },
                { status: 401 }
            );
        }

        const { question,topic_id } = await request.json()

        const topic = await TopicModel.findOne({ id: topic_id })
        if (!topic) {
            return Response.json({
                success: false,
                message: "Topic not found"
            },{ status: 404 })
        }


        const isOwner = topic.creator_username === username;
        const isCollaborator = topic.collaborators.some(
            (c: any) => c.username === username
        );
        if (!(isOwner || isCollaborator)) {
            return Response.json(
                { success: false,message: "Forbidden: cannot add problem" },
                { status: 403 }
            );
        }

        const newProblem = new ProblemModel({
            topicId: topic._id,
            qname: question.qname,
            url: question.url,
            difficulty: question.difficulty
        })

        await newProblem.save()

        const updatedProblems = await ProblemModel.find({ topicId: topic._id }).sort({
            createdAt: -1,
        });

        return Response.json({
            success: true,
            message: "Problem added successfully",
            topic,
            problems: updatedProblems
        },{ status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in adding problem'
        },{ status: 500 })
    }
}