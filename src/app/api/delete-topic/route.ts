import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"
import TopicPublicOrPrivateModel from "@/model/Topicvisible"
import UserModel from "@/model/User"


export async function DELETE(request: Request) {
    await dbConnect()
    
    try {
        const {creator_username, topic_id} = await request.json()
        
        const response = await AlltopicModel.findOneAndUpdate(
            { username: creator_username },
            { $pull: { topics: { id: topic_id } } },
            { new: true }
        )

        if(!response){
            return Response.json({
                success: false,
                message: 'Topic not found',
            }, {status: 404})
        }

        await TopicPublicOrPrivateModel.findOneAndDelete({
            topicid: topic_id,
            creator_username
        })

        return Response.json({
            success: true,
            message: 'Topic deleted successfully'
        }, {status: 201})
        
    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in deleteing topic',
        }, {status: 500})
    }
}