import { Document } from "mongoose";


export interface TopicPublicOrPrivate {
    creator_username: string;
    topicid: string;
    visibility: string;
}


export interface InviteNotificationCardProps {
    from: string;
    to: string;
    topicid: string;
    topicname: string;
    notifyid?: string;
    read?: boolean;
    fromUserId?: string;
    toUserId?: string;
}

export interface DeclineNotificationProps {
    from: string;
    topicid: string;
    topicname: string;
    read?: boolean;
    fromUserId?: string;
    toUserId?: string;
}

export interface SuggestionNotificationCardProps extends InviteNotificationCardProps {
    problemurl: string;
}

export interface HeatmapDateValues {
    date: string;
    count: number;
}

export interface Collaborator {
    username: string;
    name: string;
}

export interface Question {
    id: string;
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
    createdAt: Date
}

export interface NotificationData {
    _id?: string;
    noti_type: string;  // always
    to?: string;
    from?: string;   // not for general notify eg. rajdeep010 accepted invitation, don't need from whom he is getting
    topicid?: string;
    problemurl?: string;
    topicname?: string;
    message?: string;   // for general notify
    read: boolean;
    createdAt?: Date;
    fromUserId?: string;
    toUserId?: string;
}

export interface UserInfo {
    name?: string | null;
    username?: string | null;
    about?: string | null;
    profile?: string | null;
    linkedin?: string | null;
    company?: string | null;
    location?: string | null;
    email?: string | null;
    isVerified?: boolean | null;
    _id?: string | null;
    notifications?: NotificationData[] | [];
    avatar?: string | null
}

type TopicVisibility = 'public' | 'private'
type ProblemDifficulty = 'Easy' | 'Easy-Med' | 'Medium' | 'Med-Hard' | 'Hard' | 'Advanced'


export interface Alltopic extends Document {
    username: string;
    topics: Topic[];
}

export type ReleaseBlog = {
    id: string
    [key: string]: any
}

export type Project = {
    id: string
    title: string
    githubRepo: any // Placeholder for repo details
    releaseBlogs: ReleaseBlog[]
    [key: string]: any // Placeholder for future fields
}

export interface GitHubRepo {
    id: number
    name: string
    fullName: string
    description: string | null
    htmlUrl: string
    cloneUrl: string
    defaultBranch: string
    language: string | null
    isPrivate: boolean
    fork: boolean
    stargazersCount: number
    forksCount: number
    createdAt: string
    updatedAt: string
    pushedAt: string
    repoUrl: string
}


interface ReleaseBlog {
    id: string
    title: string
    content?: string
    version?: string
    publishedAt: string
    author?: {
        name: string
        avatar?: string
    }
    tags?: string[]
    downloadCount?: number
    viewCount?: number
}

interface ProjectDetail {
    id: string
    name: string
    description?: string
    repoUrl: string
    username: string
    defaultBranch: string
    visibility: 'public' | 'private'
    language?: string
    createdAt: string
    updatedAt: string
    lastMonitoredCommitSha?: string
    starCount?: number
    forkCount?: number
    watcherCount?: number
}

interface ProjectResponse {
    project: ProjectDetail
    releaseBlogs: ReleaseBlog[]
}

interface WebSocketMessage {
    projectId: string;
    status: 'BUILDING' | 'READY' | 'ERROR';
    message: string;
    timestamp: string;
}

export interface WebSocketMessage {
    projectId: string;
    status: 'BUILDING' | 'READY' | 'ERROR';
    message: string;
    timestamp: string;
    releaseBlog?: any;
}

export interface WebSocketState {
    connected: boolean;
    messages: Record<string, WebSocketMessage>;
    syncing: Record<string, boolean>;
}

export enum WebSocketActionType {
    CONNECT = 'WEBSOCKET_CONNECT',
    DISCONNECT = 'WEBSOCKET_DISCONNECT',
    MESSAGE_RECEIVED = 'WEBSOCKET_MESSAGE_RECEIVED',
    SYNC_START = 'WEBSOCKET_SYNC_START',
    SYNC_END = 'WEBSOCKET_SYNC_END',
}

export interface WebSocketAction {
    type: WebSocketActionType;
    payload?: any;
}