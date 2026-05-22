"use client";

import { useEffect, useReducer, createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { useNotificationSocketV2 } from "@/hooks/use-notification-socket-v2";
import NotificationReducerV2, {
	initialNotificationStateV2,
} from "@/features/notification-v2/reducers/NotificationReducerV2";
import {
	NOTIFICATION_PAGE_SIZE_V2,
	fetchNotificationsPageV2,
	fetchUnreadCountV2,
	markNotificationAsReadV2,
	normalizeSocketNotificationV2,
} from "@/services/notification-v2.service";
import type {
	NotificationCenterStateV2,
	NotificationSocketPayloadV2,
} from "@/types/notifications-v2";

interface NotificationContextValueV2 extends NotificationCenterStateV2 {
	refreshNotificationsV2: () => Promise<void>;
	loadMoreNotificationsV2: () => Promise<void>;
	markAsReadV2: (id: string) => Promise<void>;
	markVisibleAsReadV2: () => Promise<void>;
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
	const username = session?.user?.username ?? null;
	const [state, dispatch] = useReducer(NotificationReducerV2, initialNotificationStateV2);

	const hydrateNotifications = async () => {
		if (!username) return;

		dispatch({ type: "SET_ERROR", payload: null });
		dispatch({ type: "SET_INITIAL_LOADING", payload: true });

		try {
			const [page, unreadCount] = await Promise.all([
				fetchNotificationsPageV2({ username, page: 0, size: NOTIFICATION_PAGE_SIZE_V2 }),
				fetchUnreadCountV2(username),
			]);

			dispatch({ type: "SET_INITIAL_FEED", payload: page });
			dispatch({ type: "SET_UNREAD_COUNT", payload: unreadCount });
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: getErrorMessage(error, "Unable to load notifications") });
		} finally {
			dispatch({ type: "SET_INITIAL_LOADING", payload: false });
		}
	};

	const handleSocketNotification = (payload: NotificationSocketPayloadV2) => {
		const notification = normalizeSocketNotificationV2(payload);
		dispatch({ type: "PREPEND_REALTIME", payload: notification });
		toast("New Notification", {
			description: notification.payload,
		});
	};

	const connectionState = useNotificationSocketV2(username, handleSocketNotification);

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

	const refreshNotificationsV2 = async () => {
		await hydrateNotifications();
	};

	const loadMoreNotificationsV2 = async () => {
		if (!username || state.isLoadingMore || !state.hasMore) return;

		dispatch({ type: "SET_LOADING_MORE", payload: true });
		try {
			const page = await fetchNotificationsPageV2({
				username,
				page: state.nextPage,
				size: NOTIFICATION_PAGE_SIZE_V2,
			});
			dispatch({ type: "APPEND_FEED", payload: page });
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: getErrorMessage(error, "Unable to load more notifications") });
		} finally {
			dispatch({ type: "SET_LOADING_MORE", payload: false });
		}
	};

	const markAsReadV2 = async (id: string) => {
		const target = state.notifications.find((notification) => notification.id === id);
		if (!target || target.read) return;

		try {
			await markNotificationAsReadV2(id);
			dispatch({ type: "MARK_AS_READ", payload: id });
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not mark notification as read"));
		}
	};

	const markVisibleAsReadV2 = async () => {
		const unreadIds = state.notifications
			.filter((notification) => !notification.read)
			.map((notification) => notification.id);

		if (!unreadIds.length) return;

		const results = await Promise.allSettled(unreadIds.map((id) => markNotificationAsReadV2(id)));
		const successfulIds = results.flatMap((result, index) =>
			result.status === "fulfilled" ? [unreadIds[index]] : []
		);

		if (successfulIds.length) {
			dispatch({ type: "MARK_MANY_AS_READ", payload: successfulIds });
		}

		if (successfulIds.length !== unreadIds.length) {
			toast.error("Some notifications could not be marked as read");
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
