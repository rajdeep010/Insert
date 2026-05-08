import { notifyFormatter } from "@/helpers/notify-format";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { externalServices } from "@/lib/config/services";
import { usernameParamsSchema } from "@/schemas/userSchema";
import axios from "axios";
import jwt from "jsonwebtoken";
import { z } from "zod";

const INSERT_NOTIFY_SERVICE = externalServices.notification.origin;

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

	await dbConnect();

	try {
		const user = await UserModel.findOne({ username: parsedParams.data.username });

		if (!user) {
			return Response.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 404 }
			);
		}

		const isCodeValid = user.verifyCode === parsedBody.data.code;
		const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

		if (!isCodeValid) {
			return Response.json(
				{
					success: false,
					message: "Incorrect Verification Code",
				},
				{ status: 400 }
			);
		}

		if (!isCodeNotExpired) {
			return Response.json(
				{
					success: false,
					message: "Verification Code has expired",
				},
				{ status: 401 }
			);
		}

		user.isVerified = true;
		await user.save();

		try {
			const secret = process.env.NEXTAUTH_SECRET as string;
			const rawJwt = jwt.sign(
				{
					_id: user._id,
					email: user.email,
					name: user.name,
					username: user.username,
				},
				secret
			);

			const payload = notifyFormatter("USER_SIGNUP_SUCCESSFUL", {
				toUsername: user.username,
				toEmail: user.email,
				toUserId: user._id,
			});

			await axios.post(`${INSERT_NOTIFY_SERVICE}/api/email/send-email`, payload, {
				headers: {
					Authorization: `Bearer ${rawJwt}`,
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error("Email send failed:", error);
		}

		return Response.json(
			{
				success: true,
				message: "Account Verified",
			},
			{ status: 200 }
		);
	} catch {
		return Response.json(
			{
				success: false,
				message: "Error verifying user",
			},
			{ status: 500 }
		);
	}
}