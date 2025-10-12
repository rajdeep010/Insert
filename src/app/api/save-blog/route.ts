import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { blogTitle, blogContent, blogUrl, type, creator } = await request.json();

        if (!blogUrl || !type || !creator) {
            return Response.json({
                success: false,
                message: 'Wrong Details'
            }, { status: 400 });
        }

        const newBlog = new BlogModel({
            blogTitle,
            blogContent,
            blogUrl,
            type,
            creator,
            lastEdited: new Date(),
            status: "active",
            likes: [],
            comments: []
        })

        await newBlog.save()

        return Response.json({
            success: true,
            message: 'Blog saved successfully',
            blog: newBlog
        }, { status: 200 });

    } catch (error) {
        // console.log('Error in saving blog:', error);
        return Response.json({
            success: false,
            message: 'Error in saving blog'
        }, { status: 500 });
    }
}