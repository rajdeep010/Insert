import 'next-auth'
import { DefaultSession } from 'next-auth'
import { ProStatus } from '@/model/User';

declare module 'next-auth' {

    interface User {
        _id: string;
        isVerified?: boolean;
        username?: string;
        email?: string;
        linkedin?: string;
        profile?: string;
        company?: string;
        location?: string;
        about?: string;
        // notifications?:[any];
        accessToken: any;

        // GitHub fields
        githubAccessToken?: string;
        githubLogin?: string;
        githubId?: number;
        githubScopes?: string[];
        githubConnectedAt?: string;
        githubAvatarUrl?: string;
        githubName?: string;
        githubEmail?: string;

        proStatus: ProStatus;
    }

    interface Session {
        accessToken: any;
        user: {
            _id?: string;
            isVerified?: boolean;
            username?: string;
            email?: string;
            linkedin?: string;
            profile?: string;
            company?: string;
            about?: string;
            location?: string;
            // notifications?:[any];

            // GitHub fields
            githubAccessToken?: string;
            githubLogin?: string;
            githubId?: number;
            githubScopes?: string[];
            githubConnectedAt?: string;
            githubAvatarUrl?: string;
            githubName?: string;
            githubEmail?: string;

            proAccess?: boolean;
            proPlan?: string | null;
            proStartedAt?: Date | string | null;
            proExpiresAt?: Date | string | null;
            autoRenew?: boolean;

        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        _id?: string;
        isVerified?: boolean;
        username?: string;
        email?: string;
        linkedin?: string;
        profile?: string;
        company?: string;
        location?: string;
        about?: string;
        // notifications?:[any];
        accessToken: any;

        // GitHub fields
        githubAccessToken?: string;
        githubLogin?: string;
        githubId?: number;
        githubScopes?: string[];
        githubConnectedAt?: string;
        githubAvatarUrl?: string;
        githubName?: string;
        // githubEmail?: string;

        // proStatus: ProStatus;
        proAccess?: boolean;
        proPlan?: string | null;
        proStartedAt?: Date | string | null;
        proExpiresAt?: Date | string | null;
        autoRenew?: boolean;
    }
}