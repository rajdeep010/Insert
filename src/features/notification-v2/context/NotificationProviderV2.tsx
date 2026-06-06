"use client";

import axios from "axios";
import { useEffect, useReducer, createContext, useContext, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { doesNotificationMatchPathV2 } from "@/lib/notification-v2";
import { useNotificationSocketV2 } from "@/hooks/use-notification-socket-v2";
import NotificationReducerV2, {
	initialNotificationStateV2,
} from "@/features/notification-v2/reducers/NotificationReducerV2";
import {
	dismissNotificationV2,
	NOTIFICATION_PAGE_SIZE_V2,
	fetchNotificationsPageV2,
	fetchUnreadCountV2,
	markNotificationAsReadV2,
	normalizeSocketNotificationV2,
	resolveCollaborationInviteV2,
} from "@/services/notification-v2.service";
import type {
	NotificationCenterStateV2,
	NotificationItemV2Data,
	NotificationLocalActionStateV2,
	NotificationSocketPayloadV2,
} from "@/types/notifications-v2";

interface NotificationContextValueV2 extends NotificationCenterStateV2 {
	refreshNotificationsV2: () => Promise<void>;
	loadMoreNotificationsV2: () => Promise<void>;
	markAsReadV2: (id: string) => Promise<void>;
	markVisibleAsReadV2: () => Promise<void>;
	dismissNotificationV2: (notification: NotificationItemV2Data) => Promise<void>;
	completeLocalActionV2: (
		notification: NotificationItemV2Data,
		state: Exclude<NotificationLocalActionStateV2, null>
	) => Promise<void>;
}

const NotificationContextV2 = createContext<NotificationContextValueV2 | null>(null);

const getErrorMessage = (error: unknown, fallback: string) => {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return fallback;
};

export const NotificationProviderV2 = ({ children }: { children: React.ReactNode }) => {
	const { data: session, status } = useSession();
	const pathname = usePathname();
	const router = useRouter();
	const username = session?.user?.username ?? null;
	const accessToken = session?.accessToken ?? null;
	const [state, dispatch] = useReducer(NotificationReducerV2, initialNotificationStateV2);
	const baseTitleRef = useRef("Insert");
	const notificationsRef = useRef<NotificationItemV2Data[]>([]);

	const handleNotificationApiError = (error: unknown, fallback: string) => {
		const statusCode = axios.isAxiosError(error) ? error.response?.status : undefined;

		if (statusCode === 401) {
			toast.error("Session expired. Please sign in again.");
			router.push("/sign-in");
			return "Authentication required";
		}

		if (statusCode === 403) {
			toast.error("Access denied");
			return "Access denied";
		}

		return getErrorMessage(error, fallback);
	};

	const hydrateNotifications = async () => {
		if (!username || !accessToken) return;

		dispatch({ type: "SET_ERROR", payload: null });
		dispatch({ type: "SET_INITIAL_LOADING", payload: true });

		try {
			const [page, unreadCount] = await Promise.all([
				fetchNotificationsPageV2({ page: 0, size: NOTIFICATION_PAGE_SIZE_V2, accessToken }),
				fetchUnreadCountV2(accessToken),
			]);

			dispatch({ type: "SET_INITIAL_FEED", payload: page });
			dispatch({ type: "SET_UNREAD_COUNT", payload: unreadCount });
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: handleNotificationApiError(error, "Unable to load notifications") });
		} finally {
			dispatch({ type: "SET_INITIAL_LOADING", payload: false });
		}
	};

	const handleSocketNotification = (payload: NotificationSocketPayloadV2) => {
		const notification = normalizeSocketNotificationV2(payload);
		const wasExisting = notificationsRef.current.some((item) => item.id === notification.id);
		dispatch({ type: "UPSERT_REALTIME", payload: { notification, wasExisting } });

		if (wasExisting) {
			return;
		}

		toast(notification.title, {
			description: notification.message,
		});
	};

	const connectionState = useNotificationSocketV2(username, handleSocketNotification);

	useEffect(() => {
		notificationsRef.current = state.notifications;
	}, [state.notifications]);

	useEffect(() => {
		dispatch({ type: "SET_CONNECTION_STATE", payload: connectionState });
	}, [connectionState]);

	useEffect(() => {
		if (status !== "authenticated" || !username) {
			dispatch({ type: "RESET" });
			return;
		}

		void hydrateNotifications();
	}, [status, username]);

	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		const currentTitle = document.title.replace(/^\(\d+\)\s*/, "").trim();
		baseTitleRef.current = currentTitle || "Insert";
	}, [pathname]);

	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		const nextTitle = state.unreadCount > 0
			? `(${state.unreadCount}) ${baseTitleRef.current}`
			: baseTitleRef.current;

		document.title = nextTitle;

		return () => {
			document.title = baseTitleRef.current;
		};
	}, [state.unreadCount, pathname]);

	useEffect(() => {
		dispatch({
			type: "SET_CONTEXTUAL_NOTIFICATIONS",
			payload: state.notifications.filter(
				(notification) => !notification.dismissed && doesNotificationMatchPathV2(notification, pathname)
			),
		});
	}, [pathname, state.notifications]);

	const refreshNotificationsV2 = async () => {
		await hydrateNotifications();
	};

	const loadMoreNotificationsV2 = async () => {
		if (!username || !accessToken || state.isLoadingMore || !state.hasMore) return;

		dispatch({ type: "SET_LOADING_MORE", payload: true });
		try {
			const page = await fetchNotificationsPageV2({
				page: state.nextPage,
				size: NOTIFICATION_PAGE_SIZE_V2,
				accessToken,
			});
			dispatch({ type: "APPEND_FEED", payload: page });
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: handleNotificationApiError(error, "Unable to load more notifications") });
		} finally {
			dispatch({ type: "SET_LOADING_MORE", payload: false });
		}
	};

	const markAsReadV2 = async (id: string) => {
		const target = state.notifications.find((notification) => notification.id === id);
		if (!target || target.read || !accessToken) return;

		try {
			await markNotificationAsReadV2(id, accessToken);
			dispatch({ type: "MARK_AS_READ", payload: id });
		} catch (error) {
			toast.error(handleNotificationApiError(error, "Could not mark notification as read"));
		}
	};

	const markVisibleAsReadV2 = async () => {
		if (!accessToken) return;

		const unreadIds = state.notifications
			.filter((notification) => !notification.read)
			.map((notification) => notification.id);

		if (!unreadIds.length) return;

		const results = await Promise.allSettled(unreadIds.map((id) => markNotificationAsReadV2(id, accessToken)));
		const successfulIds = results.flatMap((result, index) =>
			result.status === "fulfilled" ? [unreadIds[index]] : []
		);
		const firstRejected = results.find((result) => result.status === "rejected");

		if (successfulIds.length) {
			dispatch({ type: "MARK_MANY_AS_READ", payload: successfulIds });
		}

		if (successfulIds.length !== unreadIds.length) {
			if (firstRejected?.status === "rejected") {
				toast.error(handleNotificationApiError(firstRejected.reason, "Some notifications could not be marked as read"));
			} else {
				toast.error("Some notifications could not be marked as read");
			}
		}
	};

	const dismissNotificationFromUiV2 = async (notification: NotificationItemV2Data) => {
		const existingNotification = state.notifications.find((item) => item.id === notification.id);
		if (!existingNotification) return;

		dispatch({ type: "DISMISS_NOTIFICATION", payload: notification.id });

		try {
			await dismissNotificationV2(notification.id, accessToken);
		} catch (error) {
			dispatch({
				type: "RESTORE_NOTIFICATION",
				payload: existingNotification,
			});
			toast.error(handleNotificationApiError(error, "Could not dismiss notification"));
			throw error;
		}
	};

	const completeLocalActionV2 = async (
		notification: NotificationItemV2Data,
		localState: Exclude<NotificationLocalActionStateV2, null>
	) => {
		if (!notification.collaborationRequestId) {
			toast.error("Missing collaboration request id");
			return;
		}

		try {
			await resolveCollaborationInviteV2({
				collaborationRequestId: notification.collaborationRequestId,
				action: localState,
				accessToken: session?.accessToken ?? null,
			});
			dispatch({ type: "COMPLETE_LOCAL_ACTION", payload: { id: notification.id, state: localState } });
		} catch (error) {
			toast.error(getErrorMessage(error, localState === "accepted"
				? "Could not accept collaboration invite"
				: "Could not decline collaboration invite"));
			throw error;
		}
	};

	return (
		<NotificationContextV2.Provider
			value={{
				...state,
				refreshNotificationsV2,
				loadMoreNotificationsV2,
				markAsReadV2,
				markVisibleAsReadV2,
				dismissNotificationV2: dismissNotificationFromUiV2,
				completeLocalActionV2,
			}}
		>
			{children}
		</NotificationContextV2.Provider>
	);
};

export const useNotificationsV2 = () => {
	const context = useContext(NotificationContextV2);
	if (!context) {
		throw new Error("NotificationProviderV2 must be wrapped properly");
	}
	return context;
};
