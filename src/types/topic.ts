import type { Document } from "mongoose";
import type { ProblemBlogReference } from "@/types/blog-collection";

export type TopicVisibility = "public" | "private";

export type ProblemDifficulty =
    | "Easy"
    | "Easy-Med"
    | "Medium"
    | "Med-Hard"
    | "Hard"
    | "Advanced";

export interface HeatmapDateValues {
    date: string;
    count: number;
}

export interface Collaborator {
    username: string;
    name: string;
    role?: "OWNER" | "EDITOR" | "VIEWER" | null;
}

export interface Question {
    _id?: string;
    id?: string;
    qname: string;
    url: string;
    difficulty: ProblemDifficulty;
    blogReferences?: ProblemBlogReference[];
}

export interface Topic {
    id: string;
    title: string;
    about: string;
    problems: Question[];
    visibility: TopicVisibility;
    creator_name?: string;
    creator_username: string;
    collaborators: Collaborator[];
    createdAt: Date;
}

export interface TopicPublicOrPrivate {
    creator_username: string;
    topicid: string;
    visibility: TopicVisibility;
}

export interface Alltopic extends Document {
    username: string;
    topics: Topic[];
}

export interface CurrentTopicState {
    topic: Topic;
    problems: Question[];
}