import type {
	NotificationCenterStateV2,
	NotificationConnectionStateV2,
	NotificationFeedPageV2,
	NotificationItemV2Data,
	NotificationLocalActionStateV2,
} from "@/types/notifications-v2";

type NotificationActionV2 =
	| { type: "RESET" }
	| { type: "SET_INITIAL_LOADING"; payload: boolean }
	| { type: "SET_LOADING_MORE"; payload: boolean }
	| { type: "SET_ERROR"; payload: string | null }
	| { type: "SET_CONNECTION_STATE"; payload: NotificationConnectionStateV2 }
	| { type: "SET_INITIAL_FEED"; payload: NotificationFeedPageV2 }
	| { type: "APPEND_FEED"; payload: NotificationFeedPageV2 }
	| { type: "SET_UNREAD_COUNT"; payload: number }
	| { type: "SET_CONTEXTUAL_NOTIFICATIONS"; payload: NotificationItemV2Data[] }
	| { type: "UPSERT_REALTIME"; payload: { notification: NotificationItemV2Data; wasExisting: boolean } }
	| { type: "MARK_AS_READ"; payload: string }
	| { type: "MARK_MANY_AS_READ"; payload: string[] }
	| { type: "REMOVE_NOTIFICATION"; payload: string }
	| { type: "RESTORE_NOTIFICATION"; payload: { notification: NotificationItemV2Data; index: number } }
	| { type: "COMPLETE_LOCAL_ACTION"; payload: { id: string; state: Exclude<NotificationLocalActionStateV2, null> } };

export const initialNotificationStateV2: NotificationCenterStateV2 = {
	notifications: [],
	contextualNotifications: [],
	unreadCount: 0,
	connectionState: "idle",
	isInitialLoading: false,
	isLoadingMore: false,
	error: null,
	hasMore: true,
	nextPage: 0,
	hasLoadedOnce: false,
};

const mergeNotifications = (
	current: NotificationItemV2Data[],
	incoming: NotificationItemV2Data[],
	mode: "prepend" | "append"
): NotificationItemV2Data[] => {
	const order = mode === "prepend" ? [...incoming, ...current] : [...current, ...incoming];
	const merged = new Map<string, NotificationItemV2Data>();

	for (const notification of order) {
		merged.set(notification.id, {
			...merged.get(notification.id),
			...notification,
		});
	}

	return Array.from(merged.values());
};

const countUnreadReads = (notifications: NotificationItemV2Data[], ids: string[]) => {
	const unreadIds = new Set(ids);
	return notifications.reduce((count, notification) => {
		if (!notification.read && unreadIds.has(notification.id)) {
			return count + 1;
		}
		return count;
	}, 0);
};

const insertNotificationAtIndex = (
	current: NotificationItemV2Data[],
	notification: NotificationItemV2Data,
	index: number
): NotificationItemV2Data[] => {
	const nextNotifications = current.filter((item) => item.id !== notification.id);
	const safeIndex = Math.max(0, Math.min(index, nextNotifications.length));
	nextNotifications.splice(safeIndex, 0, notification);
	return nextNotifications;
};

const updateRealtimeNotification = (
	current: NotificationItemV2Data[],
	incoming: NotificationItemV2Data
): NotificationItemV2Data[] => current.map((notification) =>
	notification.id === incoming.id
		? {
			...notification,
			...incoming,
		}
		: notification
);

export default function NotificationReducerV2(
	state: NotificationCenterStateV2,
	action: NotificationActionV2
): NotificationCenterStateV2 {
	switch (action.type) {
		case "RESET":
			return initialNotificationStateV2;
		case "SET_INITIAL_LOADING":
			return { ...state, isInitialLoading: action.payload };
		case "SET_LOADING_MORE":
			return { ...state, isLoadingMore: action.payload };
		case "SET_ERROR":
			return { ...state, error: action.payload };
		case "SET_CONNECTION_STATE":
			return { ...state, connectionState: action.payload };
		case "SET_INITIAL_FEED":
			return {
				...state,
				notifications: mergeNotifications([], action.payload.items, "append"),
				hasMore: action.payload.hasMore,
				nextPage: action.payload.page + 1,
				hasLoadedOnce: true,
				error: null,
			};
		case "APPEND_FEED":
			return {
				...state,
				notifications: mergeNotifications(state.notifications, action.payload.items, "append"),
				hasMore: action.payload.hasMore,
				nextPage: action.payload.page + 1,
				error: null,
			};
		case "SET_UNREAD_COUNT":
			return { ...state, unreadCount: Math.max(0, action.payload) };
		case "SET_CONTEXTUAL_NOTIFICATIONS":
			return { ...state, contextualNotifications: action.payload };
		case "UPSERT_REALTIME": {
			if (!action.payload.wasExisting) {
				return {
					...state,
					notifications: mergeNotifications(state.notifications, [action.payload.notification], "prepend"),
					unreadCount: action.payload.notification.read ? state.unreadCount : state.unreadCount + 1,
				};
			}

			const existingNotification = state.notifications.find(
				(notification) => notification.id === action.payload.notification.id
			);
			const nextUnreadCount = existingNotification
				? existingNotification.read === action.payload.notification.read
					? state.unreadCount
					: action.payload.notification.read
						? Math.max(0, state.unreadCount - 1)
						: state.unreadCount + 1
				: state.unreadCount;

			return {
				...state,
				notifications: updateRealtimeNotification(state.notifications, action.payload.notification),
				unreadCount: nextUnreadCount,
			};
		}
		case "MARK_AS_READ": {
			const target = state.notifications.find((notification) => notification.id === action.payload);
			return {
				...state,
				notifications: state.notifications.map((notification) =>
					notification.id === action.payload ? { ...notification, read: true } : notification
				),
				unreadCount: target && !target.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
			};
		}
		case "MARK_MANY_AS_READ": {
			const updatedCount = countUnreadReads(state.notifications, action.payload);
			const readIds = new Set(action.payload);
			return {
				...state,
				notifications: state.notifications.map((notification) =>
					readIds.has(notification.id) ? { ...notification, read: true } : notification
				),
				unreadCount: Math.max(0, state.unreadCount - updatedCount),
			};
		}
		case "REMOVE_NOTIFICATION": {
			const target = state.notifications.find((notification) => notification.id === action.payload);
			return {
				...state,
				notifications: state.notifications.filter((notification) => notification.id !== action.payload),
				contextualNotifications: state.contextualNotifications.filter((notification) => notification.id !== action.payload),
				unreadCount: target && !target.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
			};
		}
		case "RESTORE_NOTIFICATION": {
			return {
				...state,
				notifications: insertNotificationAtIndex(
					state.notifications,
					action.payload.notification,
					action.payload.index
				),
				contextualNotifications: state.contextualNotifications,
				unreadCount: !action.payload.notification.read ? state.unreadCount + 1 : state.unreadCount,
			};
		}
		case "COMPLETE_LOCAL_ACTION": {
			const target = state.notifications.find((notification) => notification.id === action.payload.id);
			const actionResult = action.payload.state === "accepted" ? "ACCEPTED" as const : "DECLINED" as const;
			const nextNotifications = state.notifications.map((notification) =>
				notification.id === action.payload.id
					? {
						...notification,
						actionCompleted: true,
						actionResult,
						localActionState: action.payload.state,
						read: true,
					}
					: notification
			);

			return {
				...state,
				notifications: nextNotifications,
				contextualNotifications: state.contextualNotifications.map((notification) =>
					notification.id === action.payload.id
						? {
							...notification,
							actionCompleted: true,
								actionResult,
							localActionState: action.payload.state,
							read: true,
						}
						: notification
				),
				unreadCount: target && !target.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
			};
		}
		default:
			return state;
	}
}
