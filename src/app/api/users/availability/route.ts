import { checkUsernameAvailability } from "@/lib/api/auth-handlers";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	return checkUsernameAvailability(searchParams.get("username"));
}