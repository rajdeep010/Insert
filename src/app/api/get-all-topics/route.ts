import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicModel from "@/model/Topic";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    await dbConnect()
    const token = await getToken({ req: request })

    try {
        let topics
        if (token?.username) {
            // If logged in, show public topics + private topics created by the user
            topics = await TopicModel.find({
                $or: [
                    { visibility: "public" },
                    { visibility: "private", creator_username: token.username }
                ]
            }).sort({ createdAt: -1 });
        } else {
            topics = await TopicModel.find({ visibility: "public" }).sort({ createdAt: -1 })
        }

        return NextResponse.json({ success: true, topics })
    } catch (err: any) {
        return NextResponse.json({ success: false, message: 'Something wrong', error: err?.message }, { status: 500 })
    }
}