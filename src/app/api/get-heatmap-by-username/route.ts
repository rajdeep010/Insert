import db from "@/firebaseConfig";
import { usernameValidation } from "@/schemas/signUpSchema";
import { get, ref } from "firebase/database";
import { z } from "zod";
import { HeatmapDateValues } from '@/types/types'


const UsernameQueryValidation = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {    
    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }

        const result = UsernameQueryValidation.safeParse(queryParam)
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                    ? usernameErrors.join(', ')
                    : 'Invalid username'
            }, { status: 400 })
        }

        const { username } = result.data
        const userValuesRef = ref(db, `users/${username}/values`)
        const snapshot = await get(userValuesRef)

        if (!snapshot.exists()) {
            return Response.json({
                success: false,
                message: 'Error in fetching heatmap values'
            }, { status: 404 })
        }

        const raw_data = snapshot.val()
        const data = Object.values(raw_data)
        const arr: HeatmapDateValues[] = data.map((elm) => {
            return elm as HeatmapDateValues
        })

        return Response.json({
            success: true,
            message: 'Heatmap values found',
            heatmap: arr
        })

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error in heatmap getting'
        }, { status: 500 })
    }
}