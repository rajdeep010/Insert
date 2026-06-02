import { z } from "zod";

import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/model/Topic";

const accessCheckSchema = z.object({
    entityType: z.enum(["TOPIC"]),
    entityId: z.string().trim().min(1, "Entity id is required"),
    username: z.string().trim().min(1, "Username is required"),
    action: z.enum([
        "VIEW",
        "EDIT",
        "DELETE",
        "MANAGE_COLLABORATORS",
    ]),
});

const unauthorizedResponse = () =>
    Response.json(
        {
            allowed: false,
        },
        { status: 401 }
    );

export async function POST(request: Request) {
    const internalApiKey = request.headers.get("x-internal-api-key");
    if (!internalApiKey || internalApiKey !== process.env.INTERNAL_API_KEY) {
        console.log('Unauthorized access attempt with API key:', internalApiKey);
        console.log('Expected API key:', process.env.INTERNAL_API_KEY);
        return unauthorizedResponse();
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return Response.json(
            {
                allowed: false,
                message: "Invalid JSON body",
            },
            { status: 400 }
        );
    }

    const parsedBody = accessCheckSchema.safeParse(body);
    if (!parsedBody.success) {
        return Response.json(
            {
                allowed: false,
                message: parsedBody.error.issues[0]?.message ?? "Invalid request body",
            },
            { status: 400 }
        );
    }

    await dbConnect();

    try {
        const topic = await TopicModel.findOne({
            id: parsedBody.data.entityId,
        }).select("creator_username");

        if (!topic) {
            return Response.json({ allowed: false }, { status: 200 });
        }

        const allowed = topic.creator_username === parsedBody.data.username;

        return Response.json(
            {
                allowed,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                allowed: false,
            },
            { status: 500 }
        );
    }
}