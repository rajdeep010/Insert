import mongoose, { Schema, Types } from "mongoose";
import type { Document } from "mongoose";

import type { BlogCollectionEntry } from "@/types/blog-collection";

export interface BlogCollection extends Document, Omit<BlogCollectionEntry, "_id" | "blogIds"> {
	blogIds: Types.ObjectId[];
}

const BlogCollectionSchema: Schema<BlogCollection> = new Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true, default: "" },
		ownerUsername: { type: String, required: true, trim: true, index: true },
		visibility: {
			type: String,
			required: true,
			enum: ["public", "private"],
			default: "private",
		},
		linkedTopicId: { type: String, trim: true, default: null },
		blogIds: [{ type: Schema.Types.ObjectId, ref: "Blog", default: [] }],
	},
	{
		timestamps: true,
	}
);

// Add performance indexes
BlogCollectionSchema.index({ ownerUsername: 1, visibility: 1, updatedAt: -1 });
BlogCollectionSchema.index({ ownerUsername: 1, createdAt: -1 });
BlogCollectionSchema.index({ visibility: 1, updatedAt: -1 });
BlogCollectionSchema.index({ linkedTopicId: 1, ownerUsername: 1 });
BlogCollectionSchema.index({ name: "text", description: "text" });

const BlogCollectionModel =
	(mongoose.models.BlogCollection as mongoose.Model<BlogCollection>) ||
	mongoose.model<BlogCollection>("BlogCollection", BlogCollectionSchema);

export default BlogCollectionModel;