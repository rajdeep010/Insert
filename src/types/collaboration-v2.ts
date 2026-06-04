export type CollaborationEntityTypeV2 = "TOPIC" | "BLOG";
export type CollaborationRoleV2 = "OWNER" | "EDITOR" | "VIEWER";
export type CollaborationInviteStatusV2 = "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED";

export interface CollaborationMembershipV2 {
	id: string;
	entityId: string;
	entityType: CollaborationEntityTypeV2;
	entityTitle: string;
	role: CollaborationRoleV2;
	grantedBy: string | null;
	grantedByDisplay: string | null;
	grantedAt: string | null;
	openPath: string;
}

export interface CollaborationInviteV2 {
	id: string;
	requestId: string;
	entityId: string;
	entityType: CollaborationEntityTypeV2;
	entityTitle: string;
	senderUsername: string | null;
	receiverUsername: string | null;
	role: CollaborationRoleV2;
	status: CollaborationInviteStatusV2;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface CollaborationTopicOptionV2 {
	id: string;
	title: string;
	creatorUsername: string;
	collaboratorCount: number;
	visibility: string | null;
	currentRole: CollaborationRoleV2;
	canManage: boolean;
}

export interface CollaborationTopicCollaboratorV2 {
	id: string;
	username: string;
	name: string | null;
	role: CollaborationRoleV2;
	grantedBy: string | null;
	isCurrentUser?: boolean;
}

export interface CollaborationInviteDraftV2 {
	entityType: CollaborationEntityTypeV2;
	entityId: string;
	receiverUsername: string;
	role: Exclude<CollaborationRoleV2, "OWNER">;
}

export interface CollaborationStateV2 {
	myCollaborations: CollaborationMembershipV2[];
	pendingInvites: CollaborationInviteV2[];
	sentInvites: CollaborationInviteV2[];
	topicOptions: CollaborationTopicOptionV2[];
	selectedTopicId: string | null;
	topicCollaborators: CollaborationTopicCollaboratorV2[];
	currentTopicRole: CollaborationRoleV2 | null;
	isInitialLoading: boolean;
	isTopicLoading: boolean;
	error: string | null;
}