import dbConnect from "@/lib/dbConnect"
import BlogModel from "@/model/Blog" // Adjust the import path based on your blog model
import UserModel from "@/model/User"



export async function DELETE(request: Request) {
    await dbConnect()

    try {
        const { creator_username, blog_id } = await request.json()
        
        if (!creator_username || !blog_id) {
            return Response.json(
                {
                    success: false,
                    message: "Creator username and blog ID are required",
                },
                { status: 400 }
            );
        }

        const blog = await BlogModel.findOne({ 
            _id: blog_id, 
            creator: creator_username 
        });

        if (!blog) {
            return Response.json(
                {
                    success: false,
                    message: "Blog not found or not owned by user",
                },
                { status: 404 }
            );
        }

        await BlogModel.deleteOne({ _id: blog._id });

        return Response.json(
            {
                success: true,
                message: "Blog deleted successfully",
                deletedBlog: {
                    id: blog._id,
                    title: blog.blogTitle
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting blog:", error);
        return Response.json({
            success: false,
            message: 'Error in deleting blog',
        }, { status: 500 })
    }
}