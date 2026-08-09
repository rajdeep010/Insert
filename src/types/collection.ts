import type { BlogEntry } from "@/types/blog";
import type { Question, Topic } from "@/types/topic";

export type CollectionType = "BLOG" | "TOPIC";
export type CollectionVisibility = "public" | "private";

export interface CollectionEntry {
    _id: string;
    name: string;
    description: string;
    ownerUsername: string;
    collectionType: CollectionType;
    visibility: CollectionVisibility;
    itemIds: string[];
    itemCount: number;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface CollectionTopicItem extends Omit<Topic, "problems"> {
    _id: string;
    problems: Question[];
}

export type CollectionItem = BlogEntry | CollectionTopicItem;

export interface CollectionDetailResponse {
    success: true;
    message: string;
    collection: CollectionEntry;
    items: CollectionItem[];
    isOwner: boolean;
}

export interface CollectionListResponse {
    success: true;
    message: string;
    collections: CollectionEntry[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNextPage: boolean;
    };
}
