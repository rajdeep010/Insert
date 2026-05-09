import { normalizeProStatus } from "@/lib/pro-status";

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
        plan?: string | null;
        startedAt?: Date | string | null;
        expiresAt?: Date | string | null;
        autoRenew?: boolean | null;
        cancelledAt?: Date | string | null;
        badgeState?: 'none' | 'expired' | 'active' | null;
    } | null;
    githubLogin?: string | null;
    githubId?: string | number | null;
    githubScopes?: string[];
    githubConnectedAt?: Date | string | null;
    githubAvatarUrl?: string | null;
    githubName?: string | null;
};

export function buildMePayload(user: UserLike) {
    const proStatus = normalizeProStatus(user.proStatus)

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
        proStatus,
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
    const proStatus = normalizeProStatus(user.proStatus)

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
        proStatus: proStatus
            ? {
                active: proStatus.active,
                badgeState: proStatus.badgeState,
            }
            : null,
    };
}