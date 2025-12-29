import { NotificationData } from "@/types/types";
import mongoose, {Schema, Document} from "mongoose";

export type ProPlan = 'monthly' | 'yearly' | null;

export interface ProStatus {
  active: boolean;
  plan: ProPlan;
  startedAt: Date | null;
  expiresAt: Date | null;
  autoRenew: boolean;
  lastOrderId: string | null;
  lastPaymentId: string | null;
  cancelledAt: Date | null;
}


export interface User extends Document{
    name: string;
    about: string;
    linkedin: string;
    profile: string;
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    verifyCode: string;
    verifyCodeExpiry: Date;
    location: string;
    company: string;
    // topic_ids: [string];
    notifications: NotificationData[]
    avatar?: string

    proStatus: ProStatus

    // GitHub fields
    githubAccessToken?: string;
    githubLogin?: string;
    githubId?: string | number;
    githubScopes?: string[];
    githubConnectedAt?: Date;
    githubAvatarUrl?: string;
    githubName?: string;
    githubEmail?: string;
}



const ProStatusSchema = new Schema<ProStatus>(
  {
    active: { type: Boolean, default: false },
    plan: { type: String, enum: ['monthly', 'yearly', null], default: null },
    startedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    autoRenew: { type: Boolean, default: false },
    lastOrderId: { type: String, default: null },
    lastPaymentId: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { _id: false }
);

const UserSchema: Schema<User> = new Schema({
    name: {
        type: String,
        trim: true,
    },
    about: {
        type: String,
        trim: true,
    },
    linkedin: {
        type: String,
        trim: true
    },
    profile: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    isVerified: {
        type: Boolean,
        required: [true, 'Verification is required'],
    },
    verifyCode: {
        type: String,
        required: [true, 'Verify Code is required'],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, 'Verify Code Expiry is required'],
    }, 
    avatar: {
        type: String,
        default: 'https://github.com/shadcn.png'
    },

    proStatus: { type: ProStatusSchema, default: () => ({}) },

    // --- GitHub fields ---
    githubAccessToken: { type: String, default: null },
    githubLogin: { type: String, default: null },
    githubId: { type: Schema.Types.Mixed, default: null },
    githubScopes: { type: [String], default: [] },
    githubConnectedAt: { type: Date, default: null },
    githubAvatarUrl: { type: String, default: null },
    githubName: { type: String, default: null },
    githubEmail: { type: String, default: 'https://github.com/shadcn.png' }
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) ||  mongoose.model<User>('User', UserSchema)
export default UserModel