import "server-only";

import mongoose from "mongoose";

import BlogModel from "@/model/Blog";
import ProblemModel from "@/model/Problem";
import TopicModel from "@/model/Topic";
import type { CollectionType, CollectionVisibility } from "@/types/collection";

type ItemAccessOptions = {
    collectionType: CollectionType;
    itemIds: string[];
    ownerUsername: string;
    visibility: CollectionVisibility;
};

export const uniqueCollectionItemIds = (itemIds: string[]) =>
    Array.from(new Set(itemIds.map((itemId) => itemId.trim()).filter(Boolean)));

export const areCollectionItemIdsWellFormed = (
    collectionType: CollectionType,
    itemIds: string[],
) => collectionType === "TOPIC" || itemIds.every((itemId) => mongoose.Types.ObjectId.isValid(itemId));

export async function validateOwnedCollectionItems({
    collectionType,
    itemIds,
    ownerUsername,
    visibility,
}: ItemAccessOptions) {
    const uniqueItemIds = uniqueCollectionItemIds(itemIds);
    if (!areCollectionItemIdsWellFormed(collectionType, uniqueItemIds)) return false;
    if (uniqueItemIds.length === 0) return true;

    if (collectionType === "BLOG") {
        const count = await BlogModel.countDocuments({
            _id: { $in: uniqueItemIds },
            creator: ownerUsername,
            status: "active",
            ...(visibility === "public" ? { type: "public" } : {}),
        });
        return count === uniqueItemIds.length;
    }

    const count = await TopicModel.countDocuments({
        id: { $in: uniqueItemIds },
        creator_username: ownerUsername,
        ...(visibility === "public" ? { visibility: "public" } : {}),
    });
    return count === uniqueItemIds.length;
}

export async function hydrateCollectionItems({
    collectionType,
    itemIds,
    ownerUsername,
    visibility,
}: ItemAccessOptions) {
    const uniqueItemIds = uniqueCollectionItemIds(itemIds);
    if (uniqueItemIds.length === 0) return [];

    if (collectionType === "BLOG") {
        const blogs = await BlogModel.find({
            _id: { $in: uniqueItemIds },
            creator: ownerUsername,
            status: "active",
            ...(visibility === "public" ? { type: "public" } : {}),
        })
            .select("_id blogTitle blogContentText blogUrl type creator blogBannerImage createdAt lastEdited status autosave")
            .lean();
        const blogMap = new Map(blogs.map((blog) => [String(blog._id), blog]));
        return uniqueItemIds.map((itemId) => blogMap.get(itemId)).filter(Boolean);
    }

    const topics = await TopicModel.find({
        id: { $in: uniqueItemIds },
        creator_username: ownerUsername,
        ...(visibility === "public" ? { visibility: "public" } : {}),
    })
        .select("_id id title about visibility creator_username createdAt")
        .lean();

    const problems = topics.length
        ? await ProblemModel.find({ topicId: { $in: topics.map((topic) => topic._id) } })
            .sort({ createdAt: 1 })
            .select("_id topicId qname url difficulty blogReferences createdAt updatedAt")
            .lean()
        : [];

    const problemsByTopic = new Map<string, typeof problems>();
    for (const problem of problems) {
        const topicId = String(problem.topicId);
        const current = problemsByTopic.get(topicId) ?? [];
        current.push(problem);
        problemsByTopic.set(topicId, current);
    }

    const topicMap = new Map(
        topics.map((topic) => [
            topic.id,
            {
                ...topic,
                collaborators: [],
                problems: problemsByTopic.get(String(topic._id)) ?? [],
            },
        ]),
    );

    return uniqueItemIds.map((itemId) => topicMap.get(itemId)).filter(Boolean);
}

export const serializeCollection = <T extends { itemIds?: unknown[] }>(collection: T) => ({
    ...collection,
    itemCount: collection.itemIds?.length ?? 0,
});
