import dbConnect from "@/lib/dbConnect";
import { resendUserOTPEmail } from "@/mail-templates/resend-user-otp";
import UserModel from "@/model/User";
import { sendEmail } from "@/utils/sendMail";
import { NextRequest } from "next/server";



export async function GET(request: NextRequest) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");

        if (!username) {
            return Response.json({ success: false, message: "Username is required" }, { status: 400 });
        }

        const user = await UserModel.findOne({ username });
        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (user.isVerified) {
            return Response.json({ success: false, message: "User is already verified" }, { status: 400 });
        }

        // Optional Redis rate limit: 1 request per 60s per user

        // Generate a fresh code and extend expiry
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        user.verifyCode = verifyCode;
        user.verifyCodeExpiry = expiryDate;
        await user.save();

        const formatted = resendUserOTPEmail(user.username, verifyCode);
        await sendEmail({ to: user.email, subject: formatted.subject, html: formatted.html });

        return Response.json({ success: true, message: "Verification code resent" }, { status: 200 });

    } catch (error) {
        return Response.json({ success: false, message: "Failed to resend verification code" }, { status: 500 });
    }
}