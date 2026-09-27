import axios from "axios"
import { getAuthenticatedAccessToken, requireAuthenticatedUsername } from "@/lib/api/auth";
import { externalServices } from "@/lib/config/services";

const agenticRagClient = axios.create({
    baseURL: externalServices.agenticRag.origin,
    timeout: 15000,
});

export async function POST(request: Request) {
    const accessToken = await getAuthenticatedAccessToken(request);
    if (!accessToken) {
        return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const question = typeof body?.question === "string" ? body.question.trim() : null;

	if (!question) {
		return Response.json({ success: false, message: "question is required" }, { status: 400 });
	}

    try {
        const response = await agenticRagClient.post(
            "/chat",
            { question },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        return Response.json({ success: true, answer: response.data.answer });
    } catch {
        return Response.json({ success: false, message: "Agent service unavailable" }, { status: 502 });
    }
}