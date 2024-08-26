import { uniqueId } from "@/helpers/unique-id"
import dbConnect from "@/lib/dbConnect"
import AlltopicModel from "@/model/Alltopic"



export async function POST(request: Request) {
    await dbConnect()
    
    try {
        const { creator_username, question, topic_id } = await request.json()
        
        const newProblem = {
            id: uniqueId,
            qname: question.qname,
            url: question.url,
            difficulty: question.difficulty
        }

        const updatedTopic = await AlltopicModel.findOneAndUpdate(
            { username: creator_username, "topics.id": topic_id },
            { $push: { "topics.$.problems": newProblem } },
            { new: true }
        )

        if(!updatedTopic){
            return Response.json({
                success: false,
                message: 'Topic not found'
            }, {status: 404})
        }

        return Response.json({
            success: true,
            message: 'Adding problem done',
            topics: updatedTopic
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in adding problem'
        }, { status: 500 })
    }
}