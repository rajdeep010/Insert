import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import UserModel from "@/model/User";
import { updateAvatarSchema } from "@/schemas/meSchema";

export async function PATCH(request: Request) {
    const username = await getAuthenticatedUsername(request);

    if (!username) {
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

    const parsedBody = updateAvatarSchema.safeParse(body);

    if (!parsedBody.success) {
        return Response.json(
            {
                success: false,
                message: parsedBody.error.issues[0]?.message ?? "Invalid avatar URL",
            },
            { status: 400 }
        );
    }

    await dbConnect();

    try {
        const updatedUser = await UserModel.findOneAndUpdate(
            { username },
            { $set: { avatar: parsedBody.data.avatarURL } },
            { new: true, runValidators: true }
        ).select("username avatar");

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Avatar updated successfully",
                userdata: {
                    username: updatedUser.username,
                    avatar: updatedUser.avatar,
                },
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error updating avatar",
            },
            { status: 500 }
        );
    }
}