import { uniqueId } from "@/helpers/unique-id"
import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"
import ProblemModel from "@/model/Problem"
import TopicModel from "@/model/Topic"



export async function POST(request: Request) {
    await dbConnect()

    try {
        const { creator_username,question,topic_id } = await request.json()

        const topic = await TopicModel.findOne({ id: topic_id })
        if (!topic) {
            return Response.json({
                success: false,
                message: "Topic not found"
            },{ status: 404 })
        }

        const newProblem = new ProblemModel({
            topicId: topic._id,
            qname: question.qname,
            url: question.url,
            difficulty: question.difficulty
        })

        await newProblem.save()

        const updatedProblems = await ProblemModel.find({ topicId: topic._id })

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