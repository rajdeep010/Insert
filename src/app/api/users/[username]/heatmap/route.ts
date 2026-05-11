import db from "@/firebaseConfig";
import { requireAuthenticatedUsername } from "@/lib/api/auth";
import { usernameParamsSchema } from "@/schemas/userSchema";
import type { HeatmapDateValues } from "@/types/topic";
import { get, ref } from "firebase/database";

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

    try {
        const username = parsedParams.data.username;
        const userValuesRef = ref(db, `users/${username}/values`);
        const snapshot = await get(userValuesRef);

        if (!snapshot.exists()) {
            return Response.json(
                {
                    success: false,
                    message: "Heatmap data not found",
                },
                { status: 404 }
            );
        }

        const rawData = snapshot.val();
        const heatmap = Object.values(rawData) as HeatmapDateValues[];

        return Response.json(
            {
                success: true,
                message: "Heatmap fetched successfully",
                heatmap,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error fetching heatmap",
            },
            { status: 500 }
        );
    }
}