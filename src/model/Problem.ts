import mongoose, { Schema, Types } from "mongoose";
import type { Document } from "mongoose";

import type { BlogReferenceKind } from "@/types/blog-collection";

interface ProblemBlogReferenceDocument {
    _id?: Types.ObjectId;
    blogId: Types.ObjectId;
    collectionId?: Types.ObjectId | null;
    kind: BlogReferenceKind;
    label?: string;
    addedBy: string;
    addedAt: Date;
}


interface Problem extends Document {
    topicId: Types.ObjectId;
    qname: string;
    url: string;
    difficulty: "Easy" | "Easy-Med" | "Medium" | "Med-Hard" | "Hard" | "Advanced";
    blogReferences: Types.DocumentArray<ProblemBlogReferenceDocument>;
}

const ProblemBlogReferenceSchema: Schema<ProblemBlogReferenceDocument> = new Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
    },
    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlogCollection",
        default: null,
    },
    kind: {
        type: String,
        required: true,
        enum: ["solution", "reference", "note"] satisfies BlogReferenceKind[],
        default: "reference",
    },
    label: {
        type: String,
        trim: true,
        default: "",
    },
    addedBy: {
        type: String,
        required: true,
        trim: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: true });

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
        enum: ['Easy', 'Easy-Med', 'Medium', 'Med-Hard', 'Hard', 'Advanced'],
    },
    blogReferences: {
		type: [ProblemBlogReferenceSchema],
		default: [],
	},
}, {
    timestamps: true
});

const ProblemModel = (mongoose.models.Problem as mongoose.Model<Problem>) || mongoose.model<Problem>('Problem', ProblemSchema)
export default ProblemModel;