import { z } from "zod";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/model/Topic";
import BlogModel from "@/model/Blog";

const accessCheckSchema = z.object({
    entityType: z.enum(["TOPIC", "BLOG"]),
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

const isObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

const buildTopicLookup = (entityId: string) => {
    if (isObjectId(entityId)) {
        return {
            $or: [{ id: entityId }, { _id: entityId }],
        };
    }

    return { id: entityId };
};

const buildBlogLookup = (entityId: string) => {
    if (isObjectId(entityId)) {
        return {
            $or: [{ _id: entityId }, { blogUrl: entityId }],
        };
    }

    return {
        $or: [{ blogUrl: entityId }],
    };
};

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
        const { action, entityId, entityType, username } = parsedBody.data;

        const entity = entityType === "BLOG"
            ? await BlogModel.findOne(buildBlogLookup(entityId)).select("creator type blogUrl").lean()
            : await TopicModel.findOne(buildTopicLookup(entityId)).select("creator_username visibility id").lean();

        if (!entity) {
            return Response.json(
                {
                    allowed: false,
                    message: `${entityType} not found`,
                },
                { status: 200 }
            );
        }

        const ownerUsername = entityType === "BLOG"
            ? String((entity as { creator?: string | null }).creator ?? "")
            : String((entity as { creator_username?: string | null }).creator_username ?? "");
        const visibility = entityType === "BLOG"
            ? String((entity as { type?: string | null }).type ?? "private")
            : String((entity as { visibility?: string | null }).visibility ?? "private");

        let allowed = false;

        switch (action) {
            case "VIEW":
                allowed = ownerUsername === username || visibility === "public";
                break;
            case "EDIT":
            case "DELETE":
            case "MANAGE_COLLABORATORS":
                allowed = ownerUsername === username;
                break;
            default:
                allowed = false;
        }

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