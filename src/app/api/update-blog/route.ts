import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog";

export async function PUT(request: Request) {
    await dbConnect();

    try {
        const { blogContent, blogUrl, creator, blogContentText, blogBannerImage, autosave } = await request.json();

        if (!blogUrl || !creator) {
            return Response.json({
                success: false,
                message: 'Wrong Details'
            }, { status: 400 });
        }

        const updatedBlog = await BlogModel.findOneAndUpdate(
            { blogUrl },
            {
                blogContent,
                lastEdited: new Date(),
                blogContentText,
                blogBannerImage,
                autosave
            },
            { new: true }
        )

        if(!updatedBlog) {
            return Response.json({
                success: false,
                message: 'Blog not found'
            }, { status: 404 })
        }

        await updatedBlog.save()

        return Response.json({
            success: true,
            message: 'Blog saved successfully',
            blog: updatedBlog
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in saving blog'
        }, { status: 500 });
    }
}