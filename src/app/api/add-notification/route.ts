import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getToken } from "next-auth/jwt";

export async function POST(request: Request) {
    await dbConnect();
    const token = await getToken({ req: request as any });

    try {
        const username = token?.username;
        const { to_whom,notification } = await request.json();

        const response = await UserModel.findOneAndUpdate(
            { username: to_whom },
            { $push: { notifications: {...notification, createdAt: new Date()} } },
            { new: true }
        );

        if (!response) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        if (to_whom === username) {
            return Response.json(
                {
                    success: true,
                    message: "Sent notification successfully",
                    notifications: response.notifications,
                },
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Sent notification successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            {
                success: false,
                message: "Error in sending notification",
            },
            { status: 500 }
        );
    }
}
