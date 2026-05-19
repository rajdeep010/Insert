import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import { buildMePayload } from "@/lib/api/user";
import UserModel from "@/model/User";
import { updateMeSchema } from "@/schemas/meSchema";

const ME_SELECT =
    "_id name username email isVerified about linkedin profile location company avatar proStatus notificationSettings githubLogin githubId githubScopes githubConnectedAt githubAvatarUrl githubName";

export async function GET(request: Request) {
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

    await dbConnect();

    try {
        const user = await UserModel.findOne({ username }).select(ME_SELECT);

        if (!user) {
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
                message: "Profile fetched successfully",
                userdata: buildMePayload(user),
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error fetching profile",
            },
            { status: 500 }
        );
    }
}

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

    const parsedBody = updateMeSchema.safeParse(body);

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
        const updateData = {
            ...parsedBody.data,
            ...(parsedBody.data.notificationSettings
                ? {
                    notificationSettings: {
                        pushEnabled: parsedBody.data.notificationSettings.pushEnabled ?? false,
                        fcmToken: parsedBody.data.notificationSettings.fcmToken ?? null,
                        updatedAt: new Date(),
                    },
                }
                : {}),
        };

        const updatedUser = await UserModel.findOneAndUpdate(
            { username },
            { $set: updateData },
            { new: true, runValidators: true }
        ).select(ME_SELECT);

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
                message: "Profile updated successfully",
                userdata: buildMePayload(updatedUser),
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error updating profile",
            },
            { status: 500 }
        );
    }
}