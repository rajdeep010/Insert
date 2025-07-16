import mongoose,{ Schema,Types } from "mongoose";

interface Problem extends Document {
    topicId: Types.ObjectId;
    qname: string;
    url: string;
    difficulty: "Easy" | "Easy-Med" | "Medium" | "Med-Hard" | "Hard" | "Advanced";
}

const ProblemSchema: Schema<Problem> = new Schema({
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        required: true,
    },
    qname: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy','Easy-Med','Medium','Med-Hard','Hard','Advanced'],
    },
},{
    timestamps: true
});

const Problem = mongoose.model<Problem>('Problem', ProblemSchema);
export default Problem;