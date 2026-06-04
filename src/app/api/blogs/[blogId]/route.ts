import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedAccessToken, requireAuthenticatedUsername } from "@/lib/api/auth";
import { resolveEntityPermissions } from "@/lib/collaboration/permissions";
import BlogModel from "@/model/Blog";
import {
    blogIdParamsSchema,
    updateBlogSchema,
} from "@/schemas/blogSchema";

type RouteContext = {
    params: {
        blogId: string;
    };
};

export async function GET(
    request: Request,
    context: RouteContext
) {
    const parsedParams = blogIdParamsSchema.safeParse(context.params);

    if (!parsedParams.success) {
        return Response.json(
            {
                success: false,
                message: parsedParams.error.issues[0]?.message ?? "Invalid blog id",
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
        const blog = await BlogModel.findById(parsedParams.data.blogId);

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

export async function PATCH(
    request: Request,
    context: RouteContext
) {
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

    const parsedParams = blogIdParamsSchema.safeParse(context.params);

    if (!parsedParams.success) {
        return Response.json(
            {
                success: false,
                message: parsedParams.error.issues[0]?.message ?? "Invalid blog id",
            },
            { status: 400 }
        );
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return Response.json(
            {
                success: false,
                message: "Invalid JSON body",
            },
            { status: 400 }
        );
    }

    const parsedBody = updateBlogSchema.safeParse(body);

    if (!parsedBody.success) {
        return Response.json(
            {
                success: false,
                message: parsedBody.error.issues[0]?.message ?? "Invalid request body",
            },
            { status: 400 }
        );
    }

    await dbConnect();

    try {
        const existingBlog = await BlogModel.findById(parsedParams.data.blogId);

        if (!existingBlog || existingBlog.status !== "active") {
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
            entityId: parsedParams.data.blogId,
            visibility: existingBlog.type,
            ownerUsername: existingBlog.creator,
            currentUsername,
            accessToken,
        });

        if (!permissions.canEdit) {
            return Response.json(
                {
                    success: false,
                    message: "You are not allowed to update this blog",
                },
                { status: 403 }
            );
        }

        const updatedBlog = await BlogModel.findByIdAndUpdate(
            parsedParams.data.blogId,
            {
                $set: {
                    ...parsedBody.data,
                    lastEdited: new Date(),
                },
            },
            { new: true, runValidators: true }
        );

        return Response.json(
            {
                success: true,
                message: "Blog updated successfully",
                blog: updatedBlog,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error updating blog",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    context: RouteContext
) {
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

    const parsedParams = blogIdParamsSchema.safeParse(context.params);

    if (!parsedParams.success) {
        return Response.json(
            {
                success: false,
                message: parsedParams.error.issues[0]?.message ?? "Invalid blog id",
            },
            { status: 400 }
        );
    }

    await dbConnect();

    try {
        const existingBlog = await BlogModel.findById(parsedParams.data.blogId);

        if (!existingBlog || existingBlog.status !== "active") {
            return Response.json(
                {
                    success: false,
                    message: "Blog not found",
                },
                { status: 404 }
            );
        }

        if (existingBlog.creator !== currentUsername) {
            return Response.json(
                {
                    success: false,
                    message: "You are not allowed to delete this blog",
                },
                { status: 403 }
            );
        }

        await BlogModel.findByIdAndDelete(parsedParams.data.blogId);

        return Response.json(
            {
                success: true,
                message: "Blog deleted successfully",
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error deleting blog",
            },
            { status: 500 }
        );
    }
}