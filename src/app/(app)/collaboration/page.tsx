import CollaborationWorkspaceV2 from "@/features/collaboration-v2/components/CollaborationWorkspaceV2";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function CollaborationPage() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.username) {
		redirect("/sign-in?callbackUrl=%2Fcollaboration");
	}

	return <CollaborationWorkspaceV2 />;
}
