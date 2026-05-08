import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const usernameAvailabilityQuerySchema = z.object({
	username: usernameValidation,
});

export async function GET(request: Request) {
	await dbConnect();

	try {
		const { searchParams } = new URL(request.url);
		const parsedQuery = usernameAvailabilityQuerySchema.safeParse({
			username: searchParams.get("username"),
		});

		if (!parsedQuery.success) {
			return Response.json(
				{
					success: false,
					message:
						parsedQuery.error.issues[0]?.message ?? "Invalid username",
				},
				{ status: 400 }
			);
		}

		const existingUser = await UserModel.findOne({
			username: parsedQuery.data.username,
		});

		if (existingUser) {
			return Response.json(
				{
					success: false,
					message: "Username is already taken",
				},
				{ status: 400 }
			);
		}

		return Response.json(
			{
				success: true,
				message: "Username is unique",
			},
			{ status: 200 }
		);
	} catch {
		return Response.json(
			{
				success: false,
				message: "Error checking username",
			},
			{ status: 500 }
		);
	}
}