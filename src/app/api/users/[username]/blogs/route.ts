import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog";
import { usernameParamsSchema } from "@/schemas/userSchema";

type RouteContext = {
    params: {
        username: string;
    };
};

export async function GET(
    _request: Request,
    context: RouteContext
) {
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

    await dbConnect();

    try {
        const blogs = await BlogModel.find({
            creator: parsedParams.data.username,
            status: "active",
            autosave: { $ne: true },
        })
            .sort({ createdAt: -1 })
            .select(
                "_id blogTitle blogContentText blogUrl type creator blogBannerImage createdAt lastEdited"
            );

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