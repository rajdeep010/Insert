import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";


export async function GET(request: Request) {
    await dbConnect()
    try {
        const docs = await AlltopicModel.find({})
        const topics = docs.flatMap(user => user.topics)

        const publicTopics = topics.filter((topic) => topic.visibility === 'public')

        return Response.json({
            success: true,
            message: 'Fetched all the topics',
            topics: publicTopics
        }, {status: 200})

    } catch (error) {
        console.log(error)

        return Response.json({
            success: false,
            message: 'Error in fetching all topics'
        }, { status: 500 })
    }
}