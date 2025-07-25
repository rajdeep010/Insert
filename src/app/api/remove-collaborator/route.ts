import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicModel from "@/model/Topic";



export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, remove_whom, topicid } = await request.json()
        if (!username || !remove_whom || !topicid) {
            return Response.json(
                {
                    success: false,
                    message: "Missing required fields: username, remove_whom, or topicid",
                },
                { status: 400 }
            );
        }

        const updatedTopic = await TopicModel.findOneAndUpdate(
            {
                id: topicid,
                creator_username: username,
            },
            {
                $pull: { collaborators: { username: remove_whom } },
            },
            { new: true }
        );

        if (!updatedTopic) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found or unauthorized",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Collaborator removed successfully",
                topic: updatedTopic,
            },
            { status: 200 }
        );

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in removing collaborator',
        },{ status: 500 })
    }
}