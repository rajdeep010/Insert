import dbConnect from "@/lib/dbConnect"
import ProblemModel from "@/model/Problem"
import TopicModel from "@/model/Topic"
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"


export async function PUT(request: NextRequest) {
    await dbConnect()
    const token = await getToken({ req: request })

    try {
        const username = token?.username
        if (!username) {
            return Response.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            )
        }

        const { topic_id, problem_id, question } = await request.json()
        console.log("Editing problem:", { topic_id, problem_id, question })

        if (!topic_id || !problem_id || !question) {
            return Response.json(
                { success: false, message: "topic_id, problem_id and question are required" },
                { status: 400 }
            )
        }

        const topic = await TopicModel.findOne({ id: topic_id })
        if (!topic) {
            return Response.json(
                { success: false, message: "Topic not found" },
                { status: 404 }
            )
        }

        const isOwner = topic.creator_username === username
        const isCollaborator = topic.collaborators.some((c: any) => c.username === username)
        if (!(isOwner || isCollaborator)) {
            return Response.json(
                { success: false, message: "Forbidden: cannot edit problem" },
                { status: 403 }
            )
        }

        const allowedDifficulties = ["Easy", "Easy-Med", "Medium", "Med-Hard", "Hard", "Advanced"] as const

        const update: Record<string, any> = {}
        if (typeof question.qname === "string") update.qname = question.qname.trim()
        if (typeof question.url === "string") update.url = question.url.trim()
        if (typeof question.difficulty === "string") {
            if (!allowedDifficulties.includes(question.difficulty)) {
                return Response.json(
                    { success: false, message: "Invalid difficulty value" },
                    { status: 400 }
                )
            }
            update.difficulty = question.difficulty
        }

        if (Object.keys(update).length === 0) {
            return Response.json(
                { success: false, message: "No valid fields to update" },
                { status: 400 }
            )
        }

        const updatedProblem = await ProblemModel.findOneAndUpdate(
            { _id: problem_id, topicId: topic._id },
            { $set: update },
            { new: true }
        )

        if (!updatedProblem) {
            return Response.json(
                { success: false, message: "Problem not found in this topic" },
                { status: 404 }
            )
        }

        const updatedProblems = await ProblemModel.find({ topicId: topic._id }).sort({ createdAt: -1 })

        return Response.json(
            {
                success: true,
                message: "Problem updated successfully",
                topic,
                problem: updatedProblem,
                problems: updatedProblems,
            },
            { status: 200 }
        )
    } catch (error) {
        console.log("Error in editing problem:", error);
        return Response.json(
            { success: false, message: "Error updating problem" },
            { status: 500 }
        )
    }
}