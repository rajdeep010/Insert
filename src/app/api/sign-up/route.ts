import { sendVerifyEmail } from "@/helpers/sendVerificationEmail";
// import { sendVerifyEmailJS } from "@/helpers/sendVerificationEmailJS";
import { sendVerifyEmailResend } from "@/helpers/sendVerifyEmailResend";
import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'


export async function POST(request: Request) {
    await dbConnect()

    try {
        const {username, email, password} = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({username})

        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: 'Username is already taken'
            }, {status: 400})
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({email})

        if(existingUserVerifiedByEmail){
            if(existingUserVerifiedByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: 'User already exist with this email'
                }, {status: 400})
            }
            else{
                return Response.json({
                    success: false,
                    message: 'Complete your verification'
                },{ status: 400 })
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
        const expiryDate = new Date()
        expiryDate.setHours(expiryDate.getHours() + 1)

        const newUser = new UserModel({
            username,
            email,
            verifyCode,
            verifyCodeExpiry: expiryDate,
            password: hashedPassword,
            isVerified: false,
            linkedin: '',
            profile: '',
            about: '',
            company: '',
            location: '',
        })

        const all_topics = new AlltopicModel({
            username,
            topics: []
        })


        await newUser.save()
        await all_topics.save()


        return Response.json({
            success: true,
            message: 'Registration successful. Check email',
            verifyCode
        },{ status: 201 })

    } catch (error) {
        // console.log(error)

        return Response.json({
            success: false,
            message: 'Error registering user'
        },{ status: 500 })
    }
}