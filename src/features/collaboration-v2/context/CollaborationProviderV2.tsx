"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useReducer } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import CollaborationReducerV2, {
	initialCollaborationStateV2,
} from "@/features/collaboration-v2/reducers/CollaborationReducerV2";
import {
	fetchMyCollaborationsV2,
	fetchEntityCollaboratorsV2,
	fetchOwnedTopicsV2,
	fetchPendingInvitesV2,
	fetchSentInvitesV2,
	inviteCollaboratorV2,
	normalizeInviteV2,
	normalizeTopicCollaboratorV2,
	resolvePendingInviteV2,
	revokeSentInviteV2,
	updateCollaboratorRoleV2,
	removeCollaboratorV2,
	normalizeTopicOptionV2,
} from "@/services/collaboration-v2.service";
import type {
	CollaborationInviteDraftV2,
	CollaborationRoleV2,
	CollaborationStateV2,
	CollaborationTopicCollaboratorV2,
	CollaborationTopicOptionV2,
} from "@/types/collaboration-v2";

interface CollaborationContextValueV2 extends CollaborationStateV2 {
	refreshCollaborationV2: () => Promise<void>;
	selectTopicV2: (topicId: string) => Promise<void>;
	inviteCollaboratorV2: (draft: CollaborationInviteDraftV2) => Promise<void>;
	resolvePendingInviteV2: (requestId: string, action: "accepted" | "declined") => Promise<void>;
	revokeSentInviteV2: (requestId: string) => Promise<void>;
	updateCollaboratorRoleV2: (collaborator: CollaborationTopicCollaboratorV2, role: Exclude<CollaborationRoleV2, "OWNER">) => Promise<void>;
	removeCollaboratorV2: (collaborator: CollaborationTopicCollaboratorV2) => Promise<void>;
	canManageSelectedTopicV2: boolean;
	hasTopicAccessV2: (topicId: string, creatorUsername?: string | null, visibility?: string | null) => boolean;
	hasBlogAccessV2: (blogId: string, creatorUsername?: string | null, visibility?: string | null) => boolean;
	canEditTopicV2: (topicId: string, creatorUsername?: string | null, visibility?: string | null) => boolean;
	canEditBlogV2: (blogId: string, creatorUsername?: string | null, visibility?: string | null) => boolean;
	canManageTopicCollaboratorsV2: (topicId: string, creatorUsername?: string | null) => boolean;
	getTopicPermissionV2: (topicId: string, creatorUsername?: string | null, visibility?: string | null) => { role: CollaborationRoleV2 | null; canView: boolean; canEdit: boolean; canManageCollaborators: boolean };
	getBlogPermissionV2: (blogId: string, creatorUsername?: string | null, visibility?: string | null) => { role: CollaborationRoleV2 | null; canView: boolean; canEdit: boolean; canManageCollaborators: boolean };
}

const CollaborationContextV2 = createContext<CollaborationContextValueV2 | null>(null);

const getErrorMessage = (error: unknown, fallback: string) => {
	if (axios.isAxiosError(error)) {
		return error.response?.data?.message || error.message || fallback;
	}
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return fallback;
};

export const CollaborationProviderV2 = ({ children }: { children: React.ReactNode }) => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const accessToken = session?.accessToken ?? null;
	const username = session?.user?.username ?? null;
	const [state, dispatch] = useReducer(CollaborationReducerV2, initialCollaborationStateV2);

	const handleAuthError = (error: unknown, fallback: string) => {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			toast.error("Session expired. Please sign in again.");
			router.push("/sign-in");
			return "Authentication required";
		}
		return getErrorMessage(error, fallback);
	};

	const loadSelectedTopic = async (topicId: string, selectedTopicOverride?: CollaborationTopicOptionV2 | null) => {
		if (!topicId || !username || !accessToken) return;
		dispatch({ type: "SET_TOPIC_LOADING", payload: true });
		try {
			const selectedTopic = selectedTopicOverride ?? state.topicOptions.find((topic) => topic.id === topicId) ?? null;
			const collaborators = await fetchEntityCollaboratorsV2(
				"TOPIC",
				topicId,
				accessToken,
				selectedTopic?.creatorUsername ?? null,
				username
			);
			const role = selectedTopic?.currentRole ?? null;
			dispatch({ type: "SET_TOPIC_CONTEXT", payload: { collaborators, role } });
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: getErrorMessage(error, "Unable to load collaborators") });
		} finally {
			dispatch({ type: "SET_TOPIC_LOADING", payload: false });
		}
	};

	const refreshCollaborationV2 = async () => {
		if (!username || !accessToken) return;
		dispatch({ type: "SET_LOADING", payload: true });
		dispatch({ type: "SET_ERROR", payload: null });
		try {
			const [myCollaborations, pendingInvites, sentInvites, rawTopics] = await Promise.all([
				fetchMyCollaborationsV2(accessToken),
				fetchPendingInvitesV2(accessToken),
				fetchSentInvitesV2(accessToken),
				fetchOwnedTopicsV2(username),
			]);
			const topicOptions = rawTopics.map((topic: Record<string, any>) => normalizeTopicOptionV2(topic, username));
			dispatch({
				type: "HYDRATE",
				payload: { myCollaborations, pendingInvites, sentInvites, topicOptions },
			});
			const nextTopicId = state.selectedTopicId ?? topicOptions[0]?.id ?? null;
			const nextTopic = topicOptions.find((topic: CollaborationTopicOptionV2) => topic.id === nextTopicId) ?? null;
			if (nextTopicId) {
				await loadSelectedTopic(nextTopicId, nextTopic);
			}
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: handleAuthError(error, "Unable to load collaboration workspace") });
		} finally {
			dispatch({ type: "SET_LOADING", payload: false });
		}
	};

	const selectTopicV2 = async (topicId: string) => {
		dispatch({ type: "SET_SELECTED_TOPIC", payload: topicId });
		const selectedTopic = state.topicOptions.find((topic) => topic.id === topicId) ?? null;
		await loadSelectedTopic(topicId, selectedTopic);
	};

	const inviteCollaboratorFromWorkspaceV2 = async (draft: CollaborationInviteDraftV2) => {
		if (!accessToken) return;
		await inviteCollaboratorV2(draft, accessToken);
		const pendingInvite = normalizeInviteV2({
			id: `${draft.entityId}-${draft.receiverUsername}-${Date.now()}`,
			entityId: draft.entityId,
			entityType: draft.entityType,
			entityTitle: state.topicOptions.find((topic) => topic.id === draft.entityId)?.title ?? draft.entityId,
			receiverUsername: draft.receiverUsername,
			role: draft.role,
			status: "PENDING",
			createdAt: new Date().toISOString(),
		});
		dispatch({ type: "ADD_SENT_INVITE", payload: pendingInvite });
		const topic = state.topicOptions.find((item) => item.id === draft.entityId);
		if (topic) {
			dispatch({
				type: "UPSERT_COLLABORATOR",
				payload: normalizeTopicCollaboratorV2(
					{ username: draft.receiverUsername, name: draft.receiverUsername, role: draft.role },
					topic.creatorUsername,
					username
				),
			});
		}
	};

	const resolvePendingInviteFromWorkspaceV2 = async (requestId: string, action: "accepted" | "declined") => {
		if (!accessToken) return;
		dispatch({ type: "UPDATE_PENDING_STATUS", payload: { requestId, status: action === "accepted" ? "ACCEPTED" : "DECLINED" } });
		try {
			await resolvePendingInviteV2(requestId, action, accessToken);
			await refreshCollaborationV2();
		} catch (error) {
			dispatch({ type: "UPDATE_PENDING_STATUS", payload: { requestId, status: "PENDING" } });
			throw error;
		}
	};

	const revokeSentInviteFromWorkspaceV2 = async (requestId: string) => {
		if (!accessToken) return;
		dispatch({ type: "UPDATE_SENT_STATUS", payload: { requestId, status: "REVOKED" } });
		try {
			await revokeSentInviteV2(requestId, accessToken);
		} catch (error) {
			dispatch({ type: "UPDATE_SENT_STATUS", payload: { requestId, status: "PENDING" } });
			throw error;
		}
	};

	const updateCollaboratorRoleFromWorkspaceV2 = async (
		collaborator: CollaborationTopicCollaboratorV2,
		role: Exclude<CollaborationRoleV2, "OWNER">
	) => {
		if (!accessToken) return;
		const previousRole = collaborator.role;
		dispatch({ type: "UPDATE_COLLABORATOR_ROLE", payload: { id: collaborator.id, role } });
		try {
			await updateCollaboratorRoleV2(collaborator.id, role, accessToken);
		} catch (error) {
			dispatch({ type: "UPDATE_COLLABORATOR_ROLE", payload: { id: collaborator.id, role: previousRole === "OWNER" ? "EDITOR" : previousRole } });
			throw error;
		}
	};

	const removeCollaboratorFromWorkspaceV2 = async (collaborator: CollaborationTopicCollaboratorV2) => {
		if (!accessToken) return;
		dispatch({ type: "REMOVE_COLLABORATOR", payload: collaborator.id });
		try {
			await removeCollaboratorV2(collaborator.id, accessToken);
		} catch (error) {
			dispatch({ type: "UPSERT_COLLABORATOR", payload: collaborator });
			throw error;
		}
	};

	useEffect(() => {
		if (status !== "authenticated" || !username || !accessToken) {
			dispatch({ type: "RESET" });
			return;
		}
		void refreshCollaborationV2();
	}, [status, username, accessToken]);

	const resolvePermission = (
		entityType: "TOPIC" | "BLOG",
		entityId: string,
		creatorUsername?: string | null,
		visibility?: string | null
	) => {
		if (username && creatorUsername === username) {
			return { role: "OWNER" as const, canView: true, canEdit: true, canManageCollaborators: true };
		}

		const membership = state.myCollaborations.find(
			(item) => item.entityType === entityType && item.entityId === entityId
		);

		if (membership?.role === "EDITOR") {
			return { role: "EDITOR" as const, canView: true, canEdit: true, canManageCollaborators: false };
		}

		if (membership?.role === "VIEWER") {
			return { role: "VIEWER" as const, canView: true, canEdit: false, canManageCollaborators: false };
		}

		if (visibility === "public") {
			return { role: null, canView: true, canEdit: false, canManageCollaborators: false };
		}

		return { role: null, canView: false, canEdit: false, canManageCollaborators: false };
	};

	const getTopicPermissionV2 = (topicId: string, creatorUsername?: string | null, visibility?: string | null) =>
		resolvePermission("TOPIC", topicId, creatorUsername, visibility);

	const getBlogPermissionV2 = (blogId: string, creatorUsername?: string | null, visibility?: string | null) =>
		resolvePermission("BLOG", blogId, creatorUsername, visibility);

	const hasTopicAccessV2 = (topicId: string, creatorUsername?: string | null, visibility?: string | null) =>
		getTopicPermissionV2(topicId, creatorUsername, visibility).canView;

	const hasBlogAccessV2 = (blogId: string, creatorUsername?: string | null, visibility?: string | null) =>
		getBlogPermissionV2(blogId, creatorUsername, visibility).canView;

	const canEditTopicV2 = (topicId: string, creatorUsername?: string | null, visibility?: string | null) =>
		getTopicPermissionV2(topicId, creatorUsername, visibility).canEdit;

	const canEditBlogV2 = (blogId: string, creatorUsername?: string | null, visibility?: string | null) =>
		getBlogPermissionV2(blogId, creatorUsername, visibility).canEdit;

	const canManageTopicCollaboratorsV2 = (topicId: string, creatorUsername?: string | null) =>
		getTopicPermissionV2(topicId, creatorUsername).canManageCollaborators;

	const canManageSelectedTopicV2 = state.currentTopicRole === "OWNER";

	return (
		<CollaborationContextV2.Provider
			value={{
				...state,
				refreshCollaborationV2,
				selectTopicV2,
				inviteCollaboratorV2: inviteCollaboratorFromWorkspaceV2,
				resolvePendingInviteV2: resolvePendingInviteFromWorkspaceV2,
				revokeSentInviteV2: revokeSentInviteFromWorkspaceV2,
				updateCollaboratorRoleV2: updateCollaboratorRoleFromWorkspaceV2,
				removeCollaboratorV2: removeCollaboratorFromWorkspaceV2,
				canManageSelectedTopicV2,
				hasTopicAccessV2,
				hasBlogAccessV2,
				canEditTopicV2,
				canEditBlogV2,
				canManageTopicCollaboratorsV2,
				getTopicPermissionV2,
				getBlogPermissionV2,
			}}
		>
			{children}
		</CollaborationContextV2.Provider>
	);
};

export const useCollaborationV2 = () => {
	const context = useContext(CollaborationContextV2);
	if (!context) {
		throw new Error("CollaborationProviderV2 must be wrapped properly");
	}
	return context;
};