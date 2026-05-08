import dbConnect from "@/lib/dbConnect";
import { resendUserOTPEmail } from "@/mail-templates/resend-user-otp";
import UserModel from "@/model/User";
import { usernameParamsSchema } from "@/schemas/userSchema";
import { sendEmail } from "@/utils/sendMail";

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

	await dbConnect();

	try {
		const user = await UserModel.findOne({ username: parsedParams.data.username });

		if (!user) {
			return Response.json(
				{ success: false, message: "User not found" },
				{ status: 404 }
			);
		}

		if (user.isVerified) {
			return Response.json(
				{ success: false, message: "User is already verified" },
				{ status: 400 }
			);
		}

		const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
		const expiryDate = new Date();
		expiryDate.setHours(expiryDate.getHours() + 1);

		user.verifyCode = verifyCode;
		user.verifyCodeExpiry = expiryDate;
		await user.save();

		const formatted = resendUserOTPEmail(user.username, verifyCode);
		await sendEmail({
			to: user.email,
			subject: formatted.subject,
			html: formatted.html,
		});

		return Response.json(
			{ success: true, message: "Verification code resent" },
			{ status: 200 }
		);
	} catch {
		return Response.json(
			{ success: false, message: "Failed to resend verification code" },
			{ status: 500 }
		);
	}
}