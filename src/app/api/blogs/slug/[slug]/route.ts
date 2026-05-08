import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import { escapeRegex, normalizeBlogSlug } from "@/lib/blog-slug";
import BlogModel from "@/model/Blog";

type RouteContext = {
    params: {
        slug: string;
    };
};

export async function GET(
    request: Request,
    context: RouteContext
) {
    const requestedSlug = context.params.slug?.trim() ?? "";
    const normalizedRequestedSlug = normalizeBlogSlug(requestedSlug);

    if (!requestedSlug || requestedSlug.length > 150 || !normalizedRequestedSlug) {
        return Response.json(
            {
                success: false,
                message: "Slug must contain only lowercase letters, numbers, and hyphens",
            },
            { status: 400 }
        );
    }

    const currentUsername = await getAuthenticatedUsername(request);

    await dbConnect();

    try {
        const blog = await BlogModel.findOne({
            blogUrl: {
				$regex: `^${escapeRegex(requestedSlug)}$`,
				$options: "i",
			},
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