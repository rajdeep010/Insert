import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedAccessToken, requireAuthenticatedUsername } from "@/lib/api/auth";
import { fetchEntityCollaborators, resolveEntityPermissions } from "@/lib/collaboration/permissions";
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

    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

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

        const accessToken = await getAuthenticatedAccessToken(request);
        const permissions = await resolveEntityPermissions({
            entityType: "BLOG",
            entityId: String(blog._id),
            visibility: blog.type,
            ownerUsername: blog.creator,
            currentUsername,
            accessToken,
        });

        if (!permissions.canView) {
            return Response.json(
                {
                    success: false,
                    message: "Access denied",
                },
                { status: 403 }
            );
        }

        const collaborators = await fetchEntityCollaborators(
            "BLOG",
            String(blog._id),
            accessToken
        );

        return Response.json(
            {
                success: true,
                message: "Blog fetched successfully",
                blog: {
                    ...blog.toObject(),
                    collaborators,
                },
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