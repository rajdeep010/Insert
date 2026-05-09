export interface UserProStatus {
    active?: boolean | null;
    badgeState?: 'none' | 'expired' | 'active' | null;
    plan?: string | null;
    startedAt?: string | Date | null;
    expiresAt?: string | Date | null;
    autoRenew?: boolean | null;
    cancelledAt?: string | Date | null;
}

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
    proStatus?: UserProStatus | null;
}

export interface UserState {
    currentUser: UserInfo | null;
    profileUser: UserInfo | null;
    publicUsersByUsername: Record<string, UserInfo>;
    isCurrentUserLoading: boolean;
    isUserLoading: boolean;
    isAvatarUploading: boolean;
}