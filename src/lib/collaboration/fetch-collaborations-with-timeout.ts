import { fetchMyCollaborations } from "@/lib/collaboration/permissions"
import type { CollaborationRoleV2 } from "@/types/collaboration-v2"

export type CollaborationEntry = {
	entityId: string
	entityType: "TOPIC" | "BLOG"
	role: CollaborationRoleV2 | null
}

export const fetchCollaborationsWithTimeout = async (
	accessToken?: string | null,
	entityType?: "TOPIC" | "BLOG",
	timeoutMs = 1200
): Promise<CollaborationEntry[]> => {
	if (!accessToken) return []

	try {
		const collaborations = await Promise.race([
			fetchMyCollaborations(accessToken, entityType),
			new Promise<CollaborationEntry[]>((resolve) => setTimeout(() => resolve([]), timeoutMs)),
		])
		return collaborations
	} catch {
		return []
	}
}