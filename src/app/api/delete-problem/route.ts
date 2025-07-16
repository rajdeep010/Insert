import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"
import Problem from "@/model/Problem"
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"


export async function DELETE(request: NextRequest) {
    await dbConnect()
    const token = await getToken({ req: request })

    try {
        const username = token?.username
        const { creator_username,topic_id,problem_id } = await request.json()

        if (!creator_username || !topic_id || !problem_id) {
            return Response.json(
                {
                    success: false,
                    message: "Sufficient details required",
                },
                { status: 400 }
            );
        }

        if (username !== creator_username) {
            return Response.json(
                {
                    success: false,
                    message: "Forbidden from deleting",
                },
                { status: 403 }
            );
        }

        const deletedProblem = await Problem.findOneAndDelete({
            _id: problem_id,
            topicId: topic_id,
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
        return Response.json({
            success: false,
            message: 'Error in deleting problem',
        },{ status: 500 })
    }
}