import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest){
    await dbConnect()
    const token = await getToken({ req: request })

    try {
        let blogs
        if (token?.username) {
            // If logged in, show public blogs + private blogs created by the user
            blogs = await BlogModel.find({
                $or: [
                    { type: "public" },
                    { type: "private", creator: token.username }
                ]
            }).sort({ lastEdited: -1 });
        } else {
            blogs = await BlogModel.find({ type: "public" }).sort({ lastEdited: -1 })
        }

        return NextResponse.json({ success: true, blogs })
    } catch (err: any) {
        return NextResponse.json({ success: false, message: 'Something wrong', error: err?.message }, { status: 500 })
    }
}