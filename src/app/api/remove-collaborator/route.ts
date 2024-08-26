import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";



export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, remove_whom, topicid } = await request.json()
        
        const findTopicByUsername = await AlltopicModel.findOneAndUpdate(
            {
                username, 
                "topics.id": topicid,
            },
            {
                $pull: { "topics.$.collaborators": remove_whom }
            },
            { new: true }
        )
        
        if(!findTopicByUsername){
            return Response.json({
                success: false,
                message: 'User topic not found',
            }, {status: 404})
        }

        return Response.json({
            success: true,
            message: 'Remove from collaborators',
        }, {status: 200})

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in removing collaborator',
        }, { status: 500 })
    }
}