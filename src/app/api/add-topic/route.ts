import { uniqueId } from "@/helpers/unique-id";
import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicPublicOrPrivateModel from "@/model/Topicvisible";


export async function POST(request: Request) {
    await dbConnect()
    
    try {
        const { creator_username, creator_name, topic } = await request.json();

        const newtopicid = uniqueId

        const newItem = {
            id: newtopicid,  // Ensure uniqueId is a function that generates a unique ID
            title: topic.title,
            about: topic.about,
            visibility: topic.visibility,
            problems: topic.problems || [],
            creator_username,
            creator_name,
            collaborators: topic.collaborators || []
        }

        const updatedTopic = await AlltopicModel.findOneAndUpdate(
            { username: creator_username },
            { $push: { topics: newItem } },
            { new: true, upsert: true } 
        )

        const newTopicVisibility = new TopicPublicOrPrivateModel({
            topicid: newtopicid,
            creator_username,
            visibility: topic.visibility
        })

        await newTopicVisibility.save()

        return Response.json({
            success: true,
            message: 'Adding topic done',
            topics: updatedTopic
        }, { status: 200 })

    } catch (error) {
        // console.log(error)
        return Response.json({
            success: false,
            message: 'Error in adding topic'
        }, { status: 500 })
    }
}
