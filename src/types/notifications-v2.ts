export type NotificationConnectionStateV2 =
	| "idle"
	| "connecting"
	| "connected"
	| "reconnecting"
	| "disconnected"
	| "error";

export interface NotificationItemV2Data {
	id: string;
	username: string;
	type: string;
	status: string;
	payload: string;
	createdAt: string;
	read: boolean;
}

export interface NotificationSocketPayloadV2 {
	id: string;
	username: string;
	type: string;
	status: string;
	payload: string;
	createdAt: string;
}

export interface NotificationFeedPageV2 {
	items: NotificationItemV2Data[];
	page: number;
	hasMore: boolean;
}

export interface NotificationCenterStateV2 {
	notifications: NotificationItemV2Data[];
	unreadCount: number;
	connectionState: NotificationConnectionStateV2;
	isInitialLoading: boolean;
	isLoadingMore: boolean;
	error: string | null;
	hasMore: boolean;
	nextPage: number;
	hasLoadedOnce: boolean;
}
