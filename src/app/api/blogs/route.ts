import dbConnect from "@/lib/dbConnect";
import { requireAuthenticatedUsername } from "@/lib/api/auth";
import { normalizeBlogSlug } from "@/lib/blog-slug";
import BlogModel from "@/model/Blog";
import { createBlogSchema } from "@/schemas/blogSchema";

const BLOG_LIST_SELECT = "_id blogTitle blogContentText blogUrl type creator blogBannerImage createdAt lastEdited autosave status";

export async function GET(request: Request) {
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

    await dbConnect();

    try {
        // Get pagination parameters
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
        const skip = (page - 1) * limit;

        const filter = {
            status: "active",
            $or: [
                { type: "public" },
                { type: "private", creator: currentUsername },
            ],
        };

        // Fetch blogs with limit and lean
        const [blogs, total] = await Promise.all([
            BlogModel.find(filter)
                .sort({ lastEdited: -1 })
                .skip(skip)
                .limit(limit)
                .select(BLOG_LIST_SELECT)
                .lean(),
            BlogModel.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);

        return Response.json(
            {
                success: true,
                message: "Blogs fetched successfully",
                blogs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: totalPages,
                    hasNextPage: page < totalPages,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching blogs:', error);
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
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }
    const currentUsername = authResult;

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