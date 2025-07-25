import mongoose, {Schema, Document} from "mongoose";


export interface Avatar extends Document {
    username: string;
    avatarURL: string;
}
const AvatarSchema: Schema<Avatar> = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
    },
    avatarURL: {
        type: String,
        trim: true,
        default: 'https://github.com/shadcn.png'
    }
})

const AvatarModel = (mongoose.models.Avatar as mongoose.Model<Avatar>) ||  mongoose.model<Avatar>('Avatar', AvatarSchema)
export default AvatarModel