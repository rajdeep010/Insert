import dbConnect from "@/lib/dbConnect";
import AvatarModel from "@/model/Avatar";


export async function GET(request: Request) { 
    await dbConnect()

    try {
        const {searchParams} = new URL(request.url)

        const username = searchParams.get('username')
        if (!username) {
            return Response.json({
                success: false,
                message: 'Username is required',
            }, { status: 400 });
        }

        const user = await AvatarModel.findOne({username})
        if(!user) {
            return Response.json({
                success: false,
                message: 'User not found',
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: 'Found',
            user
        }, { status: 200 })
        
    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in finding avatar'
        }, { status: 500 })
    }
}