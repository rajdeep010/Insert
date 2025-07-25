import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { blogTitle, blogContent, blogUrl, type, username } = await request.json();

        if (!blogTitle || !blogContent || !blogUrl || !type || !username) {
            return Response.json({
                success: false,
                message: 'Wrong Details'
            }, { status: 400 });
        }

        const blog = await BlogModel.findOne({ blogUrl, creator: username });
        if (!blog) {
            return Response.json({
                success: false,
                message: 'Blog not found'
            }, { status: 404 });
        }

        blog.blogTitle = blogTitle;
        blog.blogContent = blogContent;
        blog.type = type;
        blog.lastEdited = new Date();
        await blog.save();

        return Response.json({
            success: true,
            message: 'Blog updated successfully'
        }, { status: 200 });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in editing blog'
        }, { status: 500 });
    }
}