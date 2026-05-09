export interface NotificationData {
    _id?: string;
    noti_type: string;
    to?: string;
    from?: string;
    topicid?: string;
    problemurl?: string;
    topicname?: string;
    message?: string;
    read: boolean;
    createdAt?: Date;
    fromUserId?: string;
    toUserId?: string;
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

export interface SuggestionNotificationCardProps
    extends InviteNotificationCardProps {
    problemurl: string;
}