import { NotificationData } from "@/types/types";
import mongoose, {Schema, Document} from "mongoose";

const NotificationDataSchema: Schema<NotificationData> = new Schema({
    noti_type: {
        type: String,
        required: [true, 'Notification type required'],
        trim: true,
    },
    from: {
        type: String,
        required: [true, 'Sender username required'],
        trim: true,
    },
    topicid: {
        type: String,
        trim: true,
    },
    problemurl: {
        type: String,
        trim: true,
    },
    topicname: {
        type: String,
        trim: true,
    },
    read: {
        type: Boolean,
        required: true,
    }
})

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
}

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
    notifications: {
        type: [NotificationDataSchema],
    }
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) ||  mongoose.model<User>('User', UserSchema)
export default UserModel