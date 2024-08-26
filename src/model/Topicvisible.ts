import { TopicPublicOrPrivate } from '@/types/types';
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

const TopicPublicOrPrivateModel = mongoose.models.TopicPublicOrPrivate || mongoose.model<TopicPublicOrPrivate>('TopicPublicOrPrivate', TopicPublicOrPrivateSchema)
export default TopicPublicOrPrivateModel