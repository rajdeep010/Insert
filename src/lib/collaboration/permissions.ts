import axios from "axios";

import { externalServices } from "@/lib/config/services";
import type { CollaborationEntityTypeV2, CollaborationRoleV2 } from "@/types/collaboration-v2";

type EntityVisibility = "public" | "private" | string | null | undefined;

export interface EntityPermissionResult {
	role: CollaborationRoleV2 | null;
	canView: boolean;
	canEdit: boolean;
	canManageCollaborators: boolean;
	isOwner: boolean;
	isCollaborator: boolean;
}

export interface EntityCollaboratorSummary {
	id: string;
	username: string;
	name: string | null;
	role: CollaborationRoleV2 | null;
}

const collaborationClient = axios.create({
	baseURL: externalServices.collaboration.apiBaseUrl,
});

const extractCollection = (payload: any) => {
	if (Array.isArray(payload?.data?.content)) return payload.data.content;
	if (Array.isArray(payload?.content)) return payload.content;
	if (Array.isArray(payload?.data?.data)) return payload.data.data;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload)) return payload;
	return [];
};

const normalizeRole = (value: unknown): CollaborationRoleV2 | null => {
	if (value === "OWNER" || value === "EDITOR" || value === "VIEWER") {
		return value;
	}
	return null;
};

const normalizeEntityType = (value: unknown): CollaborationEntityTypeV2 | null => {
	if (value === "TOPIC" || value === "BLOG") {
		return value;
	}
	return null;
};

const toPermissionResult = (role: CollaborationRoleV2 | null, isOwner = false): EntityPermissionResult => {
	if (role === "OWNER" || isOwner) {
		return {
			role: "OWNER",
			canView: true,
			canEdit: true,
			canManageCollaborators: true,
			isOwner: true,
			isCollaborator: false,
		};
	}

	if (role === "EDITOR") {
		return {
			role,
			canView: true,
			canEdit: true,
			canManageCollaborators: false,
			isOwner: false,
			isCollaborator: true,
		};
	}

	if (role === "VIEWER") {
		return {
			role,
			canView: true,
			canEdit: false,
			canManageCollaborators: false,
			isOwner: false,
			isCollaborator: true,
		};
	}

	return {
		role: null,
		canView: false,
		canEdit: false,
		canManageCollaborators: false,
		isOwner: false,
		isCollaborator: false,
	};
};

export const fetchMyCollaborationRole = async (
	entityType: CollaborationEntityTypeV2,
	entityId: string,
	accessToken?: string | null
) => {
	if (!accessToken || !entityId) {
		return null;
	}

	try {
		const response = await collaborationClient.get("/collaborations/my-collaborations", {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		const memberships = extractCollection(response.data);
		const membership = memberships.find(
			(item: Record<string, any>) =>
				String(item.entityId ?? item.referenceId ?? item.topicId ?? item.blogId ?? "") === entityId &&
				(item.entityType === entityType || item.type === entityType)
		);

		return normalizeRole(membership?.role ?? null);
	} catch {
		return null;
	}
};

export const fetchMyCollaborations = async (
	accessToken?: string | null,
	entityType?: CollaborationEntityTypeV2
) => {
	if (!accessToken) {
		return [] as Array<{ entityId: string; entityType: CollaborationEntityTypeV2; role: CollaborationRoleV2 | null }>;
	}

	try {
		const response = await collaborationClient.get("/collaborations/my-collaborations", {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return extractCollection(response.data)
			.map((item: Record<string, any>) => ({
				entityId: String(item.entityId ?? item.referenceId ?? item.topicId ?? item.blogId ?? ""),
				entityType: normalizeEntityType(item.entityType ?? item.type),
				role: normalizeRole(item.role),
			}))
			.filter(
				(item: { entityId: string; entityType: CollaborationEntityTypeV2 | null; role: CollaborationRoleV2 | null }): item is { entityId: string; entityType: CollaborationEntityTypeV2; role: CollaborationRoleV2 | null } =>
					Boolean(item.entityId) && Boolean(item.entityType) && (!entityType || item.entityType === entityType)
			);
	} catch {
		return [];
	}
};

export const fetchEntityCollaborators = async (
	entityType: CollaborationEntityTypeV2,
	entityId: string,
	accessToken?: string | null
): Promise<EntityCollaboratorSummary[]> => {
	if (!accessToken || !entityId) {
		return [];
	}

	try {
		const response = await collaborationClient.get(
			`/collaborations/entity/${entityType}/${entityId}`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			}
		);

		return extractCollection(response.data)
			.map((item: Record<string, any>) => ({
				id: String(
					item.id ??
					item.collaboratorId ??
					item.userId ??
					item._id ??
					item.username ??
					""
				),
				username: String(item.username ?? item.collaboratorUsername ?? item.userName ?? ""),
				name: item.name ? String(item.name) : null,
				role: normalizeRole(item.role ?? item.collaborationRole),
			}))
			.filter((item: EntityCollaboratorSummary) => Boolean(item.username));
	} catch {
		return [];
	}
};

export const resolveEntityPermissions = async ({
	entityType,
	entityId,
	visibility,
	ownerUsername,
	currentUsername,
	accessToken,
}: {
	entityType: CollaborationEntityTypeV2;
	entityId: string;
	visibility: EntityVisibility;
	ownerUsername: string | null | undefined;
	currentUsername: string;
	accessToken?: string | null;
}): Promise<EntityPermissionResult> => {
	if (ownerUsername && ownerUsername === currentUsername) {
		return toPermissionResult("OWNER", true);
	}

	const collaboratorRole = await fetchMyCollaborationRole(entityType, entityId, accessToken);
    if (collaboratorRole === "EDITOR" || collaboratorRole === "VIEWER") {
		return toPermissionResult(collaboratorRole);
	}

	if (visibility === "public") {
		return {
			role: null,
			canView: true,
			canEdit: false,
			canManageCollaborators: false,
			isOwner: false,
			isCollaborator: false,
		};
	}

	return toPermissionResult(null);
};