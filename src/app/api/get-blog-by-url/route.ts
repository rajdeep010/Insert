import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog";


export async function GET(request: Request) {
    await dbConnect();

    try {
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