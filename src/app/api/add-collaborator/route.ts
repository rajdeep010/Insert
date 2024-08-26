import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";



export async function POST(request: Request) {
    await dbConnect()

    try {
        const { whose_topic, add_whom_username, add_whom_name, topicid } = await request.json()

        if (whose_topic === add_whom_username) {

            return Response.json({
                success: false,
                message: "Can't add yourself",
            }, { status: 400 })
        }

        const newCollab = {
            username: add_whom_username,
            name: add_whom_name,
        }


        const updateCollaborators = await AlltopicModel.findOneAndUpdate(
            { username: whose_topic, "topics.id": topicid },
            { $push: { "topics.$.collaborators": newCollab } },
            { new: true }
        )

        // console.log(updateCollaborators)


        if (!updateCollaborators) {
            return Response.json({
                success: false,
                message: 'Could not add',
            }, { status: 400 })
        }

        return Response.json({
            success: true,
            message: 'Added as collaborator',
        }, { status: 200 })

    } catch (error) {
        console.log(error)
        return Response.json({
            success: false,
            message: 'Error in adding collaborator',
        }, { status: 500 })
    }
}