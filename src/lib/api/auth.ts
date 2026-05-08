import { getToken } from "next-auth/jwt";

export async function getAuthenticatedUsername(request: Request) {
    const token = await getToken({
        req: request as any,
        secret: process.env.NEXTAUTH_SECRET,
    });

    return token?.username ?? null;
}