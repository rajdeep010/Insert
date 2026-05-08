import dbConnect from "@/lib/dbConnect";
import { getAuthenticatedUsername } from "@/lib/api/auth";
import { buildPublicUserPayload } from "@/lib/api/user";
import { userOTPEmail } from "@/mail-templates/user-otp";
import UserModel from "@/model/User";
import { signUpSchema } from "@/schemas/signUpSchema";
import { sendEmail } from "@/utils/sendMail";
import bcrypt from "bcryptjs";

const SEARCH_USER_SELECT =
    "_id name username about linkedin profile location company avatar proStatus";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const usernameQuery = searchParams.get("username")?.trim() ?? "";

    if (!usernameQuery) {
        return Response.json(
            {
                success: false,
                message: "Username query is required",
            },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const currentUsername = await getAuthenticatedUsername(request);
        const filters: Array<Record<string, unknown>> = [
            { username: { $regex: escapeRegex(usernameQuery), $options: "i" } },
        ];

        if (currentUsername) {
            filters.push({ username: { $ne: currentUsername } });
        }

        const matchedUsers = await UserModel.find({ $and: filters })
            .select(SEARCH_USER_SELECT)
            .limit(10);

        const users = matchedUsers.map(buildPublicUserPayload);

        return Response.json(
            {
                success: true,
                message: users.length > 0 ? "Found" : "No users found",
                users,
                similar_users: users,
            },
            { status: 200 }
        );
    } catch {
        return Response.json(
            {
                success: false,
                message: "Error finding users",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const parsedBody = signUpSchema.safeParse(body);

        if (!parsedBody.success) {
            return Response.json(
                {
                    success: false,
                    message:
                        parsedBody.error.issues[0]?.message ?? "Invalid signup payload",
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