import { resendVerificationCodeForUser } from "@/lib/api/auth-handlers";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const resendVerificationSchema = z.object({
	username: usernameValidation,
});

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsedBody = resendVerificationSchema.safeParse(body);

		if (!parsedBody.success) {
			return Response.json(
				{
					success: false,
					message: parsedBody.error.issues[0]?.message ?? "Invalid resend verification payload",
				},
				{ status: 400 }
			);
		}

		return resendVerificationCodeForUser(parsedBody.data.username);
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
