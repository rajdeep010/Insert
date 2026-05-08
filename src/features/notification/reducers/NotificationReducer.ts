import type { NotificationData } from "@/types/notifications";

type NotificationState = {
	notifications: NotificationData[];
	unreadNotifyCount: number;
};

type NotificationAction =
	| { type: "SET_NOTIFY_COUNT"; payload: number }
	| { type: "SET_NOTIFICATIONS"; payload: NotificationData[] }
	| { type: "MARK_ALL_READ_NOTIFICATIONS" };

export default function NotificationReducer(
	state: NotificationState,
	action: NotificationAction
) {
	switch (action.type) {
		case "SET_NOTIFY_COUNT":
			return { ...state, unreadNotifyCount: action.payload };
		case "SET_NOTIFICATIONS": {
			const notifications = action.payload;
			const unreadCount = notifications.filter((notification) => !notification.read).length;
			return { ...state, notifications, unreadNotifyCount: unreadCount };
		}
		case "MARK_ALL_READ_NOTIFICATIONS": {
			const marked = state.notifications.map((notification) => ({
				...notification,
				read: true,
			}));
			return { ...state, notifications: marked, unreadNotifyCount: 0 };
		}
		default:
			return state;
	}
}