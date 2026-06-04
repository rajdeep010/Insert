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

        if (authResult === requestedUsername) {
            const accessToken = await getAuthenticatedAccessToken(request);
            const collaborations = await fetchMyCollaborations(accessToken, "BLOG");
            const collaboratorBlogIds = collaborations
                .map((item: { entityId: string }) => item.entityId)
                .filter(Boolean);

            const [ownedBlogs, collaboratedBlogs] = await Promise.all([
                BlogModel.find({
                    creator: requestedUsername,
                    status: "active",
                })
                    .sort({ createdAt: -1 })
                    .select(select),
                collaboratorBlogIds.length
                    ? BlogModel.find({ _id: { $in: collaboratorBlogIds }, status: "active" }).select(select)
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
                },
                { status: 200 }
            );
        }

        const blogs = await BlogModel.find({
            creator: requestedUsername,
            status: "active",
            type: "public",
        })
            .sort({ createdAt: -1 })
            .select(select);

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