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
    }

    interface Session{
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
    }
}