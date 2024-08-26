import mongoose, { Schema } from "mongoose"
import { Question, Topic, Alltopic, Collaborator } from '@/types/types';



const QuestionSchema: Schema<Question> = new Schema({
    id: { type: String, required: true },
    qname: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Easy-Med', 'Medium', 'Med-Hard', 'Hard', 'Advanced'],
    },
})


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
    problems: { type: [QuestionSchema], default: [] },
    creator_name: { type: String, trim: true },
    creator_username: { type: String, required: true, trim: true },
    collaborators: { type: [CollaboratorSchema], default: [] }
})



const AlltopicSchema: Schema<Alltopic> = new Schema({
    username: { type: String, required: true, trim: true, unique: true },
    topics: { type: [TopicSchema], default: [] },
})



const AlltopicModel = mongoose.models.Alltopic || mongoose.model<Alltopic>('Alltopic', AlltopicSchema)
export default AlltopicModel
