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
}

export interface Question {
    _id?: string;
    id?: string;
    qname: string;
    url: string;
    difficulty: ProblemDifficulty;
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
    visibility: string;
}

export interface CurrentTopicState {
    topic: Topic;
    problems: Question[];
}