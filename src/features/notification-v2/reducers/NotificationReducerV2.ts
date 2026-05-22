import type {
	NotificationCenterStateV2,
	NotificationConnectionStateV2,
	NotificationFeedPageV2,
	NotificationItemV2Data,
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
	| { type: "PREPEND_REALTIME"; payload: NotificationItemV2Data }
	| { type: "MARK_AS_READ"; payload: string }
	| { type: "MARK_MANY_AS_READ"; payload: string[] };

export const initialNotificationStateV2: NotificationCenterStateV2 = {
	notifications: [],
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
) => {
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

export default function NotificationReducerV2(
	state: NotificationCenterStateV2,
	action: NotificationActionV2
) {
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
		case "PREPEND_REALTIME":
			return {
				...state,
				notifications: mergeNotifications(state.notifications, [action.payload], "prepend"),
				unreadCount: action.payload.read ? state.unreadCount : state.unreadCount + 1,
			};
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
		default:
			return state;
	}
}
