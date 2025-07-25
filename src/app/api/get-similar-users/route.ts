import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
    await dbConnect();
    const token = await getToken({ req: request });
    if (!token?.username) {
        return Response.json(
            { success: false,message: "Not authenticated" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("username") || "";

        const users = await UserModel.find({
            $and: [
                { username: { $regex: q,$options: "i" } },
                { username: { $ne: token.username } },
            ],
        });

        return Response.json(
            {
                success: true,
                message: "Found",
                similar_users: users,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return Response.json(
            {
                success: false,
                message: "Error in finding collaborators",
            },
            { status: 500 }
        );
    }
}
