import type { TopicPublicOrPrivate } from '@/types/topic';
import mongoose from "mongoose";
import { Schema } from "mongoose";


const TopicPublicOrPrivateSchema: Schema<TopicPublicOrPrivate> = new Schema({
    topicid: {
        type: String,
        required: true,
    },
    creator_username: {
        type: String,
        required: true,
    },
    visibility: {
        type: String,
        required: true,
        enum: ['public', 'private']
    }
})

// Add indexes for performance
TopicPublicOrPrivateSchema.index({ topicid: 1 }, { unique: true });
TopicPublicOrPrivateSchema.index({ creator_username: 1, visibility: 1 });
TopicPublicOrPrivateSchema.index({ visibility: 1 });

const TopicPublicOrPrivateModel = mongoose.models.TopicPublicOrPrivate || mongoose.model<TopicPublicOrPrivate>('TopicPublicOrPrivate', TopicPublicOrPrivateSchema)
export default TopicPublicOrPrivateModel