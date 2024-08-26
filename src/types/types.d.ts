import { NotificationData } from "@/types/types";
import { Document } from "mongoose";


export interface TopicPublicOrPrivate {
    creator_username: string;
    topicid: string;
    visibility: string;
}


export interface InviteNotificationCardProps {
    from: string;
    topicid: string;
    topicname: string;
    notifyid?: string;
    read?:boolean;
}

export interface DeclineNotificationProps {
    from: string;
    topicid: string;
    topicname: string;
    read?:boolean;
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
}

export interface NotificationData{
    _id?: string;
    noti_type: string;  // always
    to?: string;
    from?: string;   // not for general notify eg. rajdeep010 accepted invitation, don't need from whom he is getting
    topicid?: string;   
    problemurl?: string;
    topicname?: string;
    message?: string;   // for general notify
    read: boolean
}

interface UserInfo {
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
    notifications?: NotificationData[] | null;
}

type TopicVisibility = 'public' | 'private'
type ProblemDifficulty = 'Easy' | 'Easy-Med' | 'Medium' | 'Med-Hard' | 'Hard' | 'Advanced'


export interface Alltopic extends Document {
    username: string;
    topics: Topic[];
}