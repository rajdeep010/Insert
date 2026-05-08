import mongoose, { Schema } from "mongoose"
import type { Topic, Collaborator } from "@/types/topic";


const CollaboratorSchema: Schema<Collaborator> = new Schema({
    username: { type: String, required: true },
    name: { type: String, trim: true }
})

const TopicSchema: Schema<Topic> = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    about: { type: String, trim: true },
    visibility: {
        type: String,
        required: true,
        enum: ['public', 'private'],
    },
    creator_username: { type: String, required: true, trim: true },
    collaborators: { type: [CollaboratorSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
})

const TopicModel = mongoose.models.Topic || mongoose.model<Topic>('Topic', TopicSchema)
export default TopicModel
