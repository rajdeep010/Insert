import axios from "axios";

import { externalServices } from "@/lib/config/services";

export type CollaborationEntityType = "TOPIC" | "BLOG";
export type CollaborationRole = "EDITOR" | "VIEWER" | "OWNER";

const collaborationClient = axios.create({
	baseURL: externalServices.collaboration.apiBaseUrl,
	timeout: 10000,
});

const getAuthConfig = (accessToken?: string | null) => ({
	headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
});

export const inviteCollaborator = async ({
	entityType,
	entityId,
	receiverUsername,
	role = "EDITOR",
	accessToken,
}: {
	entityType: CollaborationEntityType;
	entityId: string;
	receiverUsername: string;
	role?: CollaborationRole;
	accessToken?: string | null;
}) => {
	return collaborationClient.post(
		"/collaborations/invite",
		{
			entityType,
			entityId,
			receiverUsername,
			role,
		},
		getAuthConfig(accessToken)
	);
};

export const fetchPendingCollaborations = async ({
	page = 0,
	size = 10,
	accessToken,
}: {
	page?: number;
	size?: number;
	accessToken?: string | null;
}) => {
	return collaborationClient.get("/collaborations/pending", {
		params: { page, size },
		...getAuthConfig(accessToken),
	});
};

export const fetchMyCollaborations = async ({
	accessToken,
}: {
	accessToken?: string | null;
}) => {
	return collaborationClient.get("/collaborations/my-collaborations", getAuthConfig(accessToken));
};

export const fetchSentInvites = async ({
	page = 0,
	size = 10,
	accessToken,
}: {
	page?: number;
	size?: number;
	accessToken?: string | null;
}) => {
	return collaborationClient.get("/collaborations/sent", {
		params: { page, size },
		...getAuthConfig(accessToken),
	});
};

export const updateCollaboratorRole = async ({
	collaboratorId,
	role,
	accessToken,
}: {
	collaboratorId: string;
	role: CollaborationRole;
	accessToken?: string | null;
}) => {
	return collaborationClient.patch(
		`/collaborations/${collaboratorId}/role`,
		{ role },
		getAuthConfig(accessToken)
	);
};

export const removeCollaborator = async ({
	collaboratorId,
	accessToken,
}: {
	collaboratorId: string;
	accessToken?: string | null;
}) => {
	return collaborationClient.delete(
		`/collaborations/${collaboratorId}`,
		getAuthConfig(accessToken)
	);
};