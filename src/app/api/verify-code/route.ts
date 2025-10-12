import { notifyFormatter } from "@/helpers/notify-format";
import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import UserModel from "@/model/User";
import axios from "axios";
import jwt from 'jsonwebtoken';

const INSERT_NOTIFY_SERVICE = 'https://insert-notification-service.onrender.com'


export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username,code } = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({ username: decodedUsername })
        if (!user) {
            return Response.json({
                success: false,
                message: 'User not found',
            },{ status: 500 })
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {

            user.isVerified = true
            await user.save()

            try {
                const SECRET = process.env.NEXTAUTH_SECRET as string;

                const rawJwt = jwt.sign(
                    {
                        _id: user._id,
                        email: user.email,
                        name: user.name,
                        username: user.username,
                    },
                    SECRET
                );

                const data = {
                    toUsername: user?.username,
                    toEmail: user?.email,
                    toUserId: user?._id
                }

                // console.log('this is data: ', data)

                const payload = notifyFormatter("USER_SIGNUP_SUCCESSFUL", data)

                await axios.post(`${INSERT_NOTIFY_SERVICE}/api/email/send-email`,
                    payload,
                    {
                        headers: {
                            "Authorization": `Bearer ${rawJwt}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            } catch (error) {
                console.error("Email sent failed: " ,error);
            }

            return Response.json({
                success: true,
                message: 'Account Verified',
            },{ status: 200 })
        }

        else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: 'Verification Code has expired',
            },{ status: 401 })
        }
        else {
            return Response.json({
                success: false,
                message: 'Incorrect Verification Code'
            },{ status: 400 })
        }

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error verifying user'
        },{ status: 500 }
        )
    }
}