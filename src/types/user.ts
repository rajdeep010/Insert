import type { NotificationData } from "@/types/notifications";

export interface UserInfo {
    _id?: string | null;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    isVerified?: boolean | null;
    about?: string | null;
    profile?: string | null;
    linkedin?: string | null;
    company?: string | null;
    location?: string | null;
    avatar?: string | null;
    notifications?: NotificationData[];
}