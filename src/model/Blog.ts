import mongoose,{ Document,Schema } from "mongoose";

export interface Comment {
  commentor: string
  description: string
  timestamp: Date
}

export interface Blog extends Document {
  blogTitle: string
  blogContent: string
  blogContentText?: string
  blogUrl: string
  lastEdited: Date
  status: string
  type: string
  likes: string[]
  comments: Comment[]
  creator: string
  autosave: boolean
  blogBannerImage?: string
}

const CommentSchema = new Schema<Comment>({
  commentor: { type: String,required: true },
  description: { type: String,required: true },
  timestamp: { type: Date,default: Date.now },
})

const BlogSchema = new Schema<Blog>({
  blogTitle: { type: String,required: true },
  blogContent: {
    type: String,
    required: true,
    default:
    `{
        "type": "doc",
        "content": 
        [
          {
            "type": "heading",
            "attrs": {
              "textAlign": null,
              "level": 1
            },
            "content": [
              {
                "type": "text",
                "text": ""
          }
        ]
      }`
  },
  blogUrl: { type: String,required: true },
  lastEdited: { type: Date,default: Date.now },
  status: { type: String,required: true,default: "active" },
  type: { type: String, required: true },
  likes: [{ type: String,default: [] }],
  comments: [CommentSchema],
  creator: { type: String,required: true },
  autosave: { type: Boolean,default: false },
  blogContentText: { type: String,default: "" },
  blogBannerImage: { type: String, default: "" },
})


const BlogModel = (mongoose.models.Blog as mongoose.Model<Blog>) || mongoose.model<Blog>('Blog',BlogSchema)
export default BlogModel

