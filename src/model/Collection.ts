import mongoose, { Schema } from "mongoose";
import type { Document, Model } from "mongoose";

import type { CollectionType, CollectionVisibility } from "@/types/collection";

export interface CollectionDocument extends Document {
    name: string;
    description: string;
    ownerUsername: string;
    collectionType: CollectionType;
    visibility: CollectionVisibility;
    itemIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

const CollectionSchema = new Schema<CollectionDocument>(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        description: { type: String, trim: true, default: "", maxlength: 1000 },
        ownerUsername: { type: String, required: true, trim: true, index: true },
        collectionType: {
            type: String,
            required: true,
            enum: ["BLOG", "TOPIC"] satisfies CollectionType[],
            immutable: true,
            index: true,
        },
        visibility: {
            type: String,
            required: true,
            enum: ["public", "private"] satisfies CollectionVisibility[],
            default: "private",
            index: true,
        },
        itemIds: {
            type: [String],
            default: [],
        },
    },
    {
        collection: "collections_v2",
        timestamps: true,
    },
);

CollectionSchema.index({ ownerUsername: 1, updatedAt: -1 });
CollectionSchema.index({ ownerUsername: 1, collectionType: 1, updatedAt: -1 });
CollectionSchema.index({ visibility: 1, collectionType: 1, updatedAt: -1 });
CollectionSchema.index({ name: "text", description: "text" });

const CollectionModel =
    (mongoose.models.CollectionV2 as Model<CollectionDocument>) ||
    mongoose.model<CollectionDocument>("CollectionV2", CollectionSchema);

export default CollectionModel;
