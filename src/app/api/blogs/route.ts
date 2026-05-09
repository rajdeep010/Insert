import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import { normalizeBlogSlug } from "@/lib/blog-slug";
import BlogModel from "@/model/Blog";
import { createBlogSchema } from "@/schemas/blogSchema";

const BLOG_LIST_SELECT =
    "_id blogTitle blogContentText blogUrl type creator blogBannerImage createdAt lastEdited autosave status";

export async function GET(request: Request) {
    const currentUsername = await getAuthenticatedUsername(request);

    await dbConnect();

    try {
        const filter = currentUsername
            ? {
                status: "active",
                autosave: { $ne: true },
                $or: [
                    { type: "public" },
                    { type: "private", creator: currentUsername },
                ],
            }
            : {
                status: "active",
                autosave: { $ne: true },
                type: "public",
            };

        const blogs = await BlogModel.find(filter)
            .sort({ lastEdited: -1 })
            .select(BLOG_LIST_SELECT);

        return Response.json(
            {
                success: true,
                message: "Blogs fetched successfully",
                blogs,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error fetching blogs",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const currentUsername = await getAuthenticatedUsername(request);

    if (!currentUsername) {
        return Response.json(
            {
                success: false,
                message: "Authentication required",
            },
            { status: 401 }
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

    const parsedBody = createBlogSchema.safeParse(body);

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
        const normalizedSlug = normalizeBlogSlug(parsedBody.data.slug);
        if (!normalizedSlug) {
            return Response.json(
                {
                    success: false,
                    message: "Slug must contain only lowercase letters, numbers, and hyphens",
                },
                { status: 400 }
            );
        }

        const existingBlog = await BlogModel.findOne({
            blogUrl: normalizedSlug,
        }).select("_id");

        if (existingBlog) {
            return Response.json(
                {
                    success: false,
                    message: "Slug already in use",
                },
                { status: 409 }
            );
        }

        const newBlog = await BlogModel.create({
            blogTitle: parsedBody.data.blogTitle,
            blogContent: parsedBody.data.blogContent,
            blogContentText: parsedBody.data.blogContentText,
            blogBannerImage: parsedBody.data.blogBannerImage || "",
            blogUrl: normalizedSlug,
            type: parsedBody.data.type,
            creator: currentUsername,
            autosave: parsedBody.data.autosave,
            status: "active",
            likes: [],
            comments: [],
        });

        return Response.json(
            {
                success: true,
                message: "Blog created successfully",
                blog: newBlog,
            },
            { status: 201 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error creating blog",
            },
            { status: 500 }
        );
    }
}