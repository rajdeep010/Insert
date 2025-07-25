import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/model/Topic";
import Problem from "@/model/Problem";
import { topicidValidation } from "@/schemas/signUpSchema";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { z } from "zod";



const TopicIdQuery = z.object({
    topic_id: topicidValidation,
});


export async function GET(request: NextRequest) {
    await dbConnect();
    const token = await getToken({ req: request });

    try {
        const { searchParams } = new URL(request.url);
        const raw = { topic_id: searchParams.get("topic_id") };
        const result = TopicIdQuery.safeParse(raw);
        if (!result.success) {
            const errs = result.error.format().topic_id?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: errs.length ? errs.join(", ") : "Invalid topic_id",
                },
                { status: 400 }
            );
        }
        const { topic_id } = result.data;

        const topic = await TopicModel.findOne({ id: topic_id });
        if (!topic) {
            return Response.json(
                { success: false,message: "Topic not found" },
                { status: 404 }
            );
        }

        const viewer = token?.username;
        const isOwner = viewer === topic.creator_username;
        const isCollaborator = topic.collaborators.some((c: any) => c.username === viewer);
        if (topic.visibility === "private" && !(isOwner || isCollaborator)) {
            return Response.json(
                { success: false,message: "Unauthorized" },
                { status: 403 }
            );
        }

        const problems = await Problem.find({ topicId: topic._id }).sort({createdAt: -1});

        return Response.json(
            {
                success: true,
                message: problems.length ? "Problems fetched" : "No problems found",
                problems,
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("GET /get-problems-by-topicid error:",err);
        return Response.json(
            { success: false,message: "Server error fetching problems" },
            { status: 500 }
        );
    }
}
