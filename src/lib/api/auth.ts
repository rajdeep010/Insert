import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getToken } from "next-auth/jwt";

const LAST_SEEN_THROTTLE_MS = 5 * 60 * 1000;

export async function getAuthenticatedUsername(request: Request) {
    const token = await getToken({
        req: request as any,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const username = token?.username ?? null;

    if (!username) {
        return null;
    }

    try {
        await dbConnect();

        const now = new Date();
        const threshold = new Date(now.getTime() - LAST_SEEN_THROTTLE_MS);

        await UserModel.updateOne(
            {
                username,
                $or: [
                    { lastSeenAt: { $exists: false } },
                    { lastSeenAt: null },
                    { lastSeenAt: { $lt: threshold } },
                ],
            },
            {
                $set: { lastSeenAt: now },
            }
        );
    } catch {
        // Ignore last-seen update failures so auth checks do not fail.
    }

    return username;
}