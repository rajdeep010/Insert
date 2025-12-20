import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: 'email',type: 'text' },
                password: { label: 'password',type: 'text' }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect()

                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })

                    if (!user) {
                        throw new Error('No user found with this email')
                    }
                    if (!user.isVerified) {
                        throw new Error('Please verify your account')
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password,user.password)
                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error('Incorrect credentials')
                    }
                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token,user,account }) {
            if (user) {
                // console.log('the user: ',user)
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.username = user.username
                token.email = user.email
                // token.notifications = user.notifications
                token.name = user.name
                
                // GitHub fields
                token.githubAccessToken = user.githubAccessToken
                token.githubLogin = user.githubLogin
                token.githubId = user.githubId
                token.githubScopes = user.githubScopes
                token.githubConnectedAt = user.githubConnectedAt
                token.githubAvatarUrl = user.githubAvatarUrl
                token.githubName = user.githubName
                // token.githubEmail = user.githubEmail

                token.proAccess = user?.proStatus?.active || false
                token.proPlan = user?.proStatus?.plan || null
                token.proStartedAt = user?.proStatus?.startedAt || null
                token.proExpiresAt = user?.proStatus?.expiresAt || null
                token.autoRenew = user?.proStatus?.autoRenew || false
            }
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session,token }) {

            if (token) {
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.username = token.username
                session.user.email = token.email
                // session.user.notifications = token.notifications
                session.user.name = token.name

                // GitHub fields
                session.user.githubAccessToken = token.githubAccessToken
                session.user.githubLogin = token.githubLogin
                session.user.githubId = token.githubId
                session.user.githubScopes = token.githubScopes
                session.user.githubConnectedAt = token.githubConnectedAt
                session.user.githubAvatarUrl = token.githubAvatarUrl
                session.user.githubName = token.githubName
                // session.user.githubEmail = token.githubEmail

                session.user.proAccess = token.proAccess
                session.user.proPlan = token.proPlan
                session.user.proStartedAt = token.proStartedAt
                session.user.proExpiresAt = token.proExpiresAt
                session.user.autoRenew = token.autoRenew

                const SECRET = process.env.NEXTAUTH_SECRET as string
                const rawJwt = jwt.sign(
                    {
                        _id: token._id,
                        email: token.email,
                        name: token.name,
                        username: token.username,
                    },
                    SECRET
                );
                session.accessToken = rawJwt;
            }

            return session
        }
    },
    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET
}