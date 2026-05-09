import { verifyUserByUsername } from "@/lib/api/auth-handlers";
import { usernameParamsSchema } from "@/schemas/userSchema";
import { z } from "zod";

const verificationBodySchema = z.object({
	code: z.string().trim().length(6, "Verification code must be 6 digits"),
});

type RouteContext = {
	params: {
		username: string;
	};
};

export async function POST(request: Request, context: RouteContext) {
	const parsedParams = usernameParamsSchema.safeParse(context.params);
	if (!parsedParams.success) {
		return Response.json(
			{
				success: false,
				message: parsedParams.error.issues[0]?.message ?? "Invalid username",
			},
			{ status: 400 }
		);
	}

	const parsedBody = verificationBodySchema.safeParse(await request.json());
	if (!parsedBody.success) {
		return Response.json(
			{
				success: false,
				message: parsedBody.error.issues[0]?.message ?? "Invalid verification code",
			},
			{ status: 400 }
		);
	}

	return verifyUserByUsername(parsedParams.data.username, parsedBody.data.code);
}