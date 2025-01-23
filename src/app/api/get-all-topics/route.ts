import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";


export async function GET(request: Request) {
    await dbConnect()
    try {
        const docs = await AlltopicModel.find({})
  
        const publicTopics = docs.reduce((acc, user) => {
            if (user.topics) {
                const filteredTopics = user.topics.filter((topic: any) => topic.visibility === 'public');
                acc.push(...filteredTopics);
            }
            return acc;
        }, [])

        // // console.log('these are the all topics: ', publicTopics)

        return Response.json({
            success: true,
            message: 'Fetched all the topics',
            topics: publicTopics,
        }, { status: 200 })

    } catch (error) {
        // // console.log(error)

        return Response.json({
            success: false,
            message: 'Error in fetching all topics'
        }, { status: 500 })
    }
}