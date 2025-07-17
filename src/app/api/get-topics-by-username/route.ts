import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import TopicModel from "@/model/Topic";
import { usernameValidation } from "@/schemas/signUpSchema";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { z } from "zod";

const UsernameQueryValidation = z.object({
    username: usernameValidation,
});

export async function GET(request: NextRequest) {
    await dbConnect();
    const token = await getToken({ req: request });

    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username"),
        };

        const result = UsernameQueryValidation.safeParse(queryParam);
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message:
                        usernameErrors?.length > 0
                            ? usernameErrors.join(", ")
                            : "Invalid username",
                },
                { status: 400 }
            );
        }

        const { username } = result.data;
        let filter: any = { creator_username: username };
        if (token?.username !== username) {
            filter.$or = [
                { visibility: "public" },
                { visibility: "private","collaborators.username": token?.username },
            ];
        }

        const topics = await TopicModel.find(filter).sort({ createdAt: -1 });

        return Response.json(
            {
                success: true,
                message: topics.length ? "Topics found" : "No topics found",
                topics,
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            {
                success: true,
                message: "Error in finding topic",
            },
            { status: 500 }
        );
    }
}
