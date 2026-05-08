type UserLike = {
    _id?: unknown;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    isVerified?: boolean | null;
    about?: string | null;
    linkedin?: string | null;
    profile?: string | null;
    location?: string | null;
    company?: string | null;
    avatar?: string | null;
    proStatus?: {
        active?: boolean;
    } | null;
    githubLogin?: string | null;
    githubId?: string | number | null;
    githubScopes?: string[];
    githubConnectedAt?: Date | string | null;
    githubAvatarUrl?: string | null;
    githubName?: string | null;
};

export function buildMePayload(user: UserLike) {
    return {
        _id: user._id != null ? String(user._id) : null,
        name: user.name ?? null,
        username: user.username ?? null,
        email: user.email ?? null,
        isVerified: user.isVerified ?? false,
        about: user.about ?? null,
        linkedin: user.linkedin ?? null,
        profile: user.profile ?? null,
        location: user.location ?? null,
        company: user.company ?? null,
        avatar: user.avatar ?? null,
        proStatus: user.proStatus ?? null,
        github: {
            connected: Boolean(user.githubId),
            login: user.githubLogin ?? null,
            name: user.githubName ?? null,
            avatarUrl: user.githubAvatarUrl ?? null,
            connectedAt: user.githubConnectedAt ?? null,
            scopes: user.githubScopes ?? [],
        },
    };
}

export function buildPublicUserPayload(user: UserLike) {
    return {
        _id: user._id != null ? String(user._id) : null,
        name: user.name ?? null,
        username: user.username ?? null,
        about: user.about ?? null,
        linkedin: user.linkedin ?? null,
        profile: user.profile ?? null,
        location: user.location ?? null,
        company: user.company ?? null,
        avatar: user.avatar ?? null,
        proStatus: user.proStatus ?? null,
        proAccess: Boolean(user.proStatus?.active),
    };
}