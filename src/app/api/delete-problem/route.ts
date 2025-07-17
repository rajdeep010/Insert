import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"
import ProblemModel from "@/model/Problem"
import TopicModel from "@/model/Topic"
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"


export async function DELETE(request: NextRequest) {
    await dbConnect()
    const token = await getToken({ req: request })

    try {
        const username = token?.username
        const { topic_id,problem_id } = await request.json()
        console.log('delete prblm: ', topic_id, problem_id)

        if (!topic_id || !problem_id) {
            return Response.json(
                {
                    success: false,
                    message: "Sufficient details required",
                },
                { status: 400 }
            );
        }

        const topic = await TopicModel.findOne({id: topic_id})
        if(!topic){
            return Response.json(
                {
                    success: false,
                    message: "Topic does not exist",
                },
                { status: 404 }
            );
        }

        if (username !== topic?.creator_username) {
            return Response.json(
                {
                    success: false,
                    message: "Forbidden from deleting",
                },
                { status: 403 }
            );
        }

        const deletedProblem = await ProblemModel.findOneAndDelete({
            _id: problem_id,
            topicId: topic._id,
        });

        if (!deletedProblem) {
            return Response.json(
                {
                    success: false,
                    message: "Problem not found or already deleted",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Problem deleted successfully",
            },
            { status: 200 }
        );

    } catch (error) {
        console.log('error in deleting problm: ', error)
        return Response.json({
            success: false,
            message: 'Error in deleting problem',
        },{ status: 500 })
    }
}