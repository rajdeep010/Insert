import { verifyUserRegistration } from "@/lib/api/auth-handlers";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		return verifyUserRegistration(body);
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
