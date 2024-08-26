import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"


export async function DELETE(request: Request) {
    await dbConnect()
    
    try {

        const { creator_username, topic_id, problem_id } = await request.json()

        const response = await AlltopicModel.findOneAndUpdate(
            { username: creator_username, "topics.id": topic_id },
            { $pull: { "topics.$.problems": { id: problem_id } } },
            { new: true }
        )

        if(!response){
            return Response.json({
                success: false,
                message: 'Problem not found',
            }, {status: 404})
        }

        return Response.json({
            success: true,
            message: 'Problem deleted successfully'
        }, {status: 201})

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in deleting problem',
        }, { status: 500 })
    }
}