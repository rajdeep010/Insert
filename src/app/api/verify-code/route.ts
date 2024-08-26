import dbConnect from "@/lib/dbConnect";
import AlltopicModel from "@/model/Alltopic";
import UserModel from "@/model/User";


export async function POST(request: Request) {
    await dbConnect()

    try {
        const {username, code} = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUsername})
        if(!user){
            return Response.json({
                success: false,
                message: 'User not found',
            },{status:500})
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        
        if(isCodeValid && isCodeNotExpired)
        {
            
            user.isVerified = true
            await user.save()
           
            return Response.json({
                success: true,
                message: 'Account Verified',
            }, {status: 200})
        }

        else if(!isCodeNotExpired){
            return Response.json({
                success: false,
                message: 'Verification Code has expired',
            }, {status: 401})
        }
        else{
            return Response.json({
                success: false,
                message: 'Incorrect Verification Code'
            }, {status: 400})
        }

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error verifying user'
        }, { status: 500 }
        )
    }
}