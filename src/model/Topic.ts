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

TopicSchema.index({ id: 1 }, { unique: true });
TopicSchema.index({ creator_username: 1, createdAt: -1 });
TopicSchema.index({ creator_username: 1, visibility: 1, createdAt: -1 });
TopicSchema.index({ visibility: 1, createdAt: -1 });
// Additional performance indexes
TopicSchema.index({ creator_username: 1, visibility: 1 });
TopicSchema.index({ visibility: 1 });
TopicSchema.index({ title: "text", about: "text" });

const TopicModel = mongoose.models.Topic || mongoose.model<Topic>('Topic', TopicSchema)
export default TopicModel
