import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    
    interface User{
        _id: string;
        isVerified?: boolean;
        username?: string;
        email?: string;
        linkedin?: string;
        profile?: string;
        company?:string;
        location?:string;
        about?:string;
        notifications?:[any];
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
    }

    interface Session{
        accessToken: any;
        user: {
            _id?: string;
            isVerified?: boolean;
            username?: string;
            email?: string;
            linkedin?: string;
            profile?: string;
            company?:string;
            about?:string;
            location?:string;
            notifications?:[any];
           
            // GitHub fields
            githubAccessToken?: string;
            githubLogin?: string;
            githubId?: number;
            githubScopes?: string[];
            githubConnectedAt?: string;
            githubAvatarUrl?: string;
            githubName?: string;
            githubEmail?: string;
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
        profile?:string;
        company?:string;
        location?:string;
        about?:string;
        notifications?:[any];
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
    }
}