import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import BlogModel from "@/model/Blog";
import { blogSlugParamsSchema } from "@/schemas/blogSchema";

type RouteContext = {
    params: {
        slug: string;
    };
};

export async function GET(
    request: Request,
    context: RouteContext
) {
    const parsedParams = blogSlugParamsSchema.safeParse(context.params);

    if (!parsedParams.success) {
        return Response.json(
            {
                success: false,
                message: parsedParams.error.issues[0]?.message ?? "Invalid slug",
            },
            { status: 400 }
        );
    }

    const currentUsername = await getAuthenticatedUsername(request);

    await dbConnect();

    try {
        const blog = await BlogModel.findOne({
            blogUrl: parsedParams.data.slug,
        });

        if (!blog || blog.status !== "active") {
            return Response.json(
                {
                    success: false,
                    message: "Blog not found",
                },
                { status: 404 }
            );
        }

        if (blog.type === "private" && blog.creator !== currentUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Blog not found",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Blog fetched successfully",
                blog,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error fetching blog",
            },
            { status: 500 }
        );
    }
}