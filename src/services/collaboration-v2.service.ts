import axios from "axios";

import { externalServices } from "@/lib/config/services";
import type {
	CollaborationEntityTypeV2,
	CollaborationInviteDraftV2,
	CollaborationInviteStatusV2,
	CollaborationInviteV2,
	CollaborationMembershipV2,
	CollaborationRoleV2,
	CollaborationTopicCollaboratorV2,
	CollaborationTopicOptionV2,
} from "@/types/collaboration-v2";

const collaborationClientV2 = axios.create({
	baseURL: externalServices.collaboration.apiBaseUrl,
	timeout: 10000,
});

const getAuthConfig = (accessToken?: string | null) => ({
	headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
});

const normalizeEntityType = (value: unknown): CollaborationEntityTypeV2 =>
	value === "BLOG" ? "BLOG" : "TOPIC";

const normalizeRole = (value: unknown): CollaborationRoleV2 => {
	if (value === "OWNER" || value === "VIEWER" || value === "EDITOR") {
		return value;
	}
	return "EDITOR";
};

const normalizeStatus = (value: unknown): CollaborationInviteStatusV2 => {
	if (value === "ACCEPTED" || value === "DECLINED" || value === "REVOKED" || value === "PENDING") {
		return value;
	}
	return "PENDING";
};

const buildEntityPath = (entityType: CollaborationEntityTypeV2, entityId: string) =>
	entityType === "BLOG" ? `/blog/${entityId}` : `/topic/${entityId}`;

const extractCollection = (payload: any) => {
	if (Array.isArray(payload?.data?.content)) return payload.data.content;
	if (Array.isArray(payload?.content)) return payload.content;
	if (Array.isArray(payload?.data?.data)) return payload.data.data;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload)) return payload;
	return [];
};

const resolveEntityTitle = (value: Record<string, any>, fallbackId: string) => {
	const directTitle =
		value.entityTitle ??
		value.title ??
		value.entityName ??
		value.topicTitle ??
		value.topicName ??
		value.blogTitle ??
		value.name;

	if (typeof directTitle === "string" && directTitle.trim()) {
		return directTitle;
	}

	const nestedTitle =
		value.entity?.title ??
		value.entity?.name ??
		value.topic?.title ??
		value.topic?.name ??
		value.blog?.title ??
		value.blog?.name ??
		value.reference?.title ??
		value.reference?.name ??
		value.resource?.title ??
		value.resource?.name ??
		value.target?.title ??
		value.target?.name;

	if (typeof nestedTitle === "string" && nestedTitle.trim()) {
		return nestedTitle;
	}

	return fallbackId;
};

export const normalizeMembershipV2 = (value: Record<string, any>): CollaborationMembershipV2 => {
	const entityType = normalizeEntityType(value.entityType ?? value.type);
	const entityId = String(value.entityId ?? value.referenceId ?? value.topicId ?? value.blogId ?? "");
	return {
		id: String(value.id ?? value.collaboratorId ?? `${entityType}-${entityId}-${value.username ?? "membership"}`),
		entityId,
		entityType,
		entityTitle: resolveEntityTitle(value, entityId),
		role: normalizeRole(value.role),
		grantedBy: value.grantedByUsername ? String(value.grantedByUsername) : value.grantedBy ? String(value.grantedBy) : null,
		grantedByDisplay: value.grantedByName ? String(value.grantedByName) : null,
		grantedAt: value.grantedAt ? String(value.grantedAt) : value.createdAt ? String(value.createdAt) : null,
		openPath: buildEntityPath(entityType, entityId),
	};
};

export const normalizeInviteV2 = (value: Record<string, any>): CollaborationInviteV2 => {
	const entityType = normalizeEntityType(value.entityType ?? value.type);
	const entityId = String(value.entityId ?? value.referenceId ?? value.topicId ?? value.blogId ?? "");
	const requestId = String(value.id ?? value.requestId ?? value.collaborationRequestId ?? `${entityType}-${entityId}-${value.createdAt ?? Date.now()}`);
	return {
		id: requestId,
		requestId,
		entityId,
		entityType,
		entityTitle: resolveEntityTitle(value, entityId),
		senderUsername: value.senderUsername ? String(value.senderUsername) : value.actorUsername ? String(value.actorUsername) : value.from ? String(value.from) : null,
		receiverUsername: value.receiverUsername ? String(value.receiverUsername) : value.to ? String(value.to) : null,
		role: normalizeRole(value.role),
		status: normalizeStatus(value.status),
		createdAt: value.createdAt ? String(value.createdAt) : null,
		updatedAt: value.updatedAt ? String(value.updatedAt) : null,
	};
};

export const normalizeTopicOptionV2 = (
	value: Record<string, any>,
	currentUsername?: string | null
): CollaborationTopicOptionV2 => ({
	id: String(value.id ?? value._id ?? ""),
	title: resolveEntityTitle(value, String(value.id ?? value._id ?? "Untitled topic")),
	creatorUsername: String(value.creator_username ?? value.creatorUsername ?? ""),
	collaboratorCount: Array.isArray(value.collaborators) ? value.collaborators.length : 0,
	visibility: value.visibility ? String(value.visibility) : null,
	currentRole:
		String(value.creator_username ?? value.creatorUsername ?? "") === currentUsername ? "OWNER" : "EDITOR",
	canManage: String(value.creator_username ?? value.creatorUsername ?? "") === currentUsername,
});

export const normalizeTopicCollaboratorV2 = (
	value: Record<string, any>,
	grantedBy: string | null,
	currentUsername?: string | null
): CollaborationTopicCollaboratorV2 => ({
	id: String(
		value.id ??
		value.collaboratorId ??
		value.userId ??
		value._id ??
		value.username ??
		""
	),
	username: String(value.username ?? value.collaboratorUsername ?? value.userName ?? ""),
	name: value.name ? String(value.name) : null,
	role: normalizeRole(value.role ?? value.collaborationRole),
	grantedBy,
	isCurrentUser: currentUsername
		? String(value.username ?? value.collaboratorUsername ?? value.userName ?? "") === currentUsername
		: false,
});

export const fetchMyCollaborationsV2 = async (accessToken?: string | null) => {
	const response = await collaborationClientV2.get("/collaborations/my-collaborations", getAuthConfig(accessToken));
	return extractCollection(response.data).map((item: Record<string, any>) => normalizeMembershipV2(item));
};

export const fetchPendingInvitesV2 = async (accessToken?: string | null) => {
	const response = await collaborationClientV2.get("/collaborations/pending", {
		params: { page: 0, size: 20 },
		...getAuthConfig(accessToken),
	});
	return extractCollection(response.data).map((item: Record<string, any>) => normalizeInviteV2(item));
};

export const fetchSentInvitesV2 = async (accessToken?: string | null) => {
	const response = await collaborationClientV2.get("/collaborations/sent", {
		params: { page: 0, size: 20 },
		...getAuthConfig(accessToken),
	});
	return extractCollection(response.data).map((item: Record<string, any>) => normalizeInviteV2(item));
};

export const fetchOwnedTopicsV2 = async (username: string) => {
	const response = await axios.get(`/api/users/${username}/topics`);
	return Array.isArray(response.data?.topics) ? response.data.topics : [];
};

export const fetchEntityCollaboratorsV2 = async (
	entityType: CollaborationEntityTypeV2,
	entityId: string,
	accessToken?: string | null,
	grantedBy?: string | null,
	currentUsername?: string | null
) => {
	const response = await collaborationClientV2.get(
		`/collaborations/entity/${entityType}/${entityId}`,
		getAuthConfig(accessToken)
	);
	return extractCollection(response.data).map((item: Record<string, any>) =>
		normalizeTopicCollaboratorV2(item, grantedBy ?? null, currentUsername)
	);
};

export const inviteCollaboratorV2 = async (
	draft: CollaborationInviteDraftV2,
	accessToken?: string | null
) => {
	await collaborationClientV2.post(
		"/collaborations/invite",
		{
			entityType: draft.entityType,
			entityId: draft.entityId,
			receiverUsername: draft.receiverUsername,
			role: draft.role,
		},
		getAuthConfig(accessToken)
	);
	};

export const resolvePendingInviteV2 = async (
	requestId: string,
	action: "accepted" | "declined",
	accessToken?: string | null
) => {
	const endpoint = action === "accepted"
		? `/collaborations/${requestId}/accept`
		: `/collaborations/${requestId}/decline`;
	await collaborationClientV2.post(endpoint, {}, getAuthConfig(accessToken));
	};

export const updateCollaboratorRoleV2 = async (
	collaboratorId: string,
	role: Exclude<CollaborationRoleV2, "OWNER">,
	accessToken?: string | null
) => {
	await collaborationClientV2.patch(
		`/collaborations/${collaboratorId}/role`,
		{ role },
		getAuthConfig(accessToken)
	);
	};

export const removeCollaboratorV2 = async (collaboratorId: string, accessToken?: string | null) => {
	await collaborationClientV2.delete(`/collaborations/${collaboratorId}`, getAuthConfig(accessToken));
	};

export const revokeSentInviteV2 = async (requestId: string, accessToken?: string | null) => {
	await collaborationClientV2.delete(`/requests/${requestId}`, getAuthConfig(accessToken));
	};