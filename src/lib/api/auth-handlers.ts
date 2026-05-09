import { notifyFormatter } from "@/helpers/notify-format";
import { externalServices } from "@/lib/config/services";
import dbConnect from "@/lib/dbConnect";
import { resendUserOTPEmail } from "@/mail-templates/resend-user-otp";
import { userOTPEmail } from "@/mail-templates/user-otp";
import UserModel from "@/model/User";
import { signUpSchema, usernameValidation } from "@/schemas/signUpSchema";
import { sendEmail } from "@/utils/sendMail";
import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const INSERT_NOTIFY_SERVICE = externalServices.notification.origin;

const verificationPayloadSchema = z.object({
	username: usernameValidation,
	code: z.string().trim().length(6, "Verification code must be 6 digits"),
});

const usernamePayloadSchema = z.object({
	username: usernameValidation,
});

export async function registerUser(body: unknown) {
	await dbConnect();

	try {
		const parsedBody = signUpSchema.safeParse(body);

		if (!parsedBody.success) {
			return Response.json(
				{
					success: false,
					message: parsedBody.error.issues[0]?.message ?? "Invalid signup payload",
				},
				{ status: 400 }
			);
		}

		const { username, email, password } = parsedBody.data;

		const existingUserByUsername = await UserModel.findOne({ username });
		if (existingUserByUsername) {
			return Response.json(
				{
					success: false,
					message: "Username is already taken",
				},
				{ status: 400 }
			);
		}

		const existingUserByEmail = await UserModel.findOne({ email });
		if (existingUserByEmail) {
			return Response.json(
				{
					success: false,
					message: existingUserByEmail.isVerified
						? "User already exist with this email"
						: "Complete your verification",
				},
				{ status: 400 }
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
		const expiryDate = new Date();
		expiryDate.setMinutes(expiryDate.getMinutes() + 5);

		const newUser = new UserModel({
			username,
			email,
			verifyCode,
			verifyCodeExpiry: expiryDate,
			password: hashedPassword,
			isVerified: false,
			linkedin: "",
			profile: "",
			about: "",
			company: "",
			location: "",
		});

		await newUser.save();

		const formatted = userOTPEmail(username, verifyCode);
		await sendEmail({
			to: email,
			subject: formatted.subject,
			html: formatted.html,
		});

		return Response.json(
			{
				success: true,
				message: "Registration successful. Check email",
			},
			{ status: 201 }
		);
	} catch {
		return Response.json(
			{
				success: false,
				message: "Error registering user",
			},
			{ status: 500 }
		);
	}
}

export async function verifyUserRegistration(body: unknown) {
	const parsedBody = verificationPayloadSchema.safeParse(body);
	if (!parsedBody.success) {
		return Response.json(
			{
				success: false,
				message: parsedBody.error.issues[0]?.message ?? "Invalid verification payload",
			},
			{ status: 400 }
		);
	}

	return verifyUserByUsername(parsedBody.data.username, parsedBody.data.code);
}

export async function verifyUserByUsername(username: string, code: string) {
	await dbConnect();

	try {
		const user = await UserModel.findOne({ username });

		if (!user) {
			return Response.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 404 }
			);
		}

		const isCodeValid = user.verifyCode === code;
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

export async function checkUsernameAvailability(username: string | null) {
	const parsedUsername = usernamePayloadSchema.safeParse({ username });
	if (!parsedUsername.success) {
		return Response.json(
			{
				success: false,
				message: parsedUsername.error.issues[0]?.message ?? "Invalid username",
			},
			{ status: 400 }
		);
	}

	await dbConnect();

	try {
		const existingUser = await UserModel.findOne({ username: parsedUsername.data.username });

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

export async function resendVerificationCodeForUser(username: string) {
	const parsedUsername = usernameValidation.safeParse(username);
	if (!parsedUsername.success) {
		return Response.json(
			{
				success: false,
				message: parsedUsername.error.issues[0]?.message ?? "Invalid username",
			},
			{ status: 400 }
		);
	}

	await dbConnect();

	try {
		const user = await UserModel.findOne({ username: parsedUsername.data });

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