import { resendVerificationCodeForUser } from "@/lib/api/auth-handlers";
import { usernameParamsSchema } from "@/schemas/userSchema";

type RouteContext = {
	params: {
		username: string;
	};
};

export async function POST(_request: Request, context: RouteContext) {
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

	return resendVerificationCodeForUser(parsedParams.data.username);
}