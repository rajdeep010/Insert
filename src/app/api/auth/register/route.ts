import { registerUser } from "@/lib/api/auth-handlers";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		return registerUser(body);
	} catch {
		return Response.json(
			{
				success: false,
				message: "Invalid JSON body",
			},
			{ status: 400 }
		);
	}
}
