import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"
import ProblemModel from "@/model/Problem"
import TopicModel from "@/model/Topic"
import TopicPublicOrPrivateModel from "@/model/Topicvisible"
import UserModel from "@/model/User"


export async function DELETE(request: Request) {
    await dbConnect()

    try {
        const { creator_username,topic_id } = await request.json()
        if (!creator_username || !topic_id) {
            return Response.json(
                {
                    success: false,
                    message: "Sufficient details required",
                },
                { status: 400 }
            );
        }

        const topic = await TopicModel.findOne({ id: topic_id,creator_username });
        if (!topic) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found or not owned by user",
                },
                { status: 404 }
            );
        }

        await TopicModel.deleteOne({ _id: topic._id });
        await ProblemModel.deleteMany({ topicId: topic._id });

        return Response.json(
            {
                success: true,
                message: "Topic and related problems deleted successfully",
            },
            { status: 200 }
        );

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in deleteing topic',
        },{ status: 500 })
    }
}