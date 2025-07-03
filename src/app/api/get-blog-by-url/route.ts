import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
    const token = await getToken({ req: request })
    await dbConnect();

    try {
        // console.log('this is my token: ', token)
        const username = token?.username

        const { searchParams } = new URL(request.url);
        const queryParam = {
            blogUrl: searchParams.get('blogUrl')
        }

        const blogUrl = queryParam?.blogUrl

        if (!blogUrl) {
            return Response.json({
                success: false,
                message: 'blogUrl is required'
            }, { status: 400 });
        }

        const blog = await BlogModel.findOne({ blogUrl });
        if (!blog) {
            return Response.json({
                success: false,
                message: 'Blog not found'
            }, { status: 404 });
        }

        if(blog?.type === 'private' && blog?.creator !== username){
            return Response.json({
                success: false,
                message: 'Blog not found'
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: 'Blog found',
            blog
        }, { status: 200 });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in fetching blog'
        }, { status: 500 });
    }
}