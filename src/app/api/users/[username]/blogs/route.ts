import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedAccessToken, requireAuthenticatedUsername } from "@/lib/api/auth";
import { fetchMyCollaborations } from "@/lib/collaboration/permissions";
import BlogModel from "@/model/Blog";
import { usernameParamsSchema } from "@/schemas/userSchema";

type RouteContext = {
    params: {
        username: string;
    };
};

export async function GET(
    request: Request,
    context: RouteContext
) {
    const authResult = await requireAuthenticatedUsername(request);
    if (authResult instanceof Response) {
        return authResult;
    }

    const parsedParams = usernameParamsSchema.safeParse(context.params);

    if (!parsedParams.success) {
        return Response.json(
            {
                success: false,
                message:
                    parsedParams.error.issues[0]?.message ?? "Invalid username",
            },
            { status: 400 }
        );
    }

    const requestedUsername = parsedParams.data.username;

    await dbConnect();

    try {
        const select = "_id blogTitle blogContentText blogUrl type creator blogBannerImage createdAt lastEdited status";

        // Get pagination parameters
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
        const skip = (page - 1) * limit;

        if (authResult === requestedUsername) {
            const accessToken = await getAuthenticatedAccessToken(request);
            
            let collaboratorBlogIds: string[] = [];
            try {
                const collaborations = await Promise.race([
                    fetchMyCollaborations(accessToken, "BLOG"),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Collaboration fetch timeout')), 5000))
                ]) as Array<{ entityId: string }>;
                collaboratorBlogIds = collaborations
                    .map((item: { entityId: string }) => item.entityId)
                    .filter(Boolean);
            } catch (error) {
                console.warn('Failed to fetch blog collaborations:', error);
            }

            const [ownedBlogs, collaboratedBlogs] = await Promise.all([
                BlogModel.find({
                    creator: requestedUsername,
                    status: "active",
                })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select(select)
                    .lean(),
                collaboratorBlogIds.length
                    ? BlogModel.find({ _id: { $in: collaboratorBlogIds }, status: "active" })
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit)
                        .select(select)
                        .lean()
                    : Promise.resolve([]),
            ]);

            const blogs = Array.from(
                new Map(
                    [...ownedBlogs, ...collaboratedBlogs].map((blog) => [String(blog._id), blog])
                ).values()
            ).sort((left: any, right: any) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime());

            return Response.json(
                {
                    success: true,
                    message: "Blogs fetched successfully",
                    blogs,
                    pagination: { page, limit },
                },
                { status: 200 }
            );
        }

        const [publicBlogs, total] = await Promise.all([
            BlogModel.find({
                creator: requestedUsername,
                status: "active",
                type: "public",
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select(select)
                .lean(),
            BlogModel.countDocuments({
                creator: requestedUsername,
                status: "active",
                type: "public",
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return Response.json(
            {
                success: true,
                message: "Blogs fetched successfully",
                blogs: publicBlogs,
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