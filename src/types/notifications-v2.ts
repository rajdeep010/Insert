export type NotificationConnectionStateV2 =
	| "idle"
	| "connecting"
	| "connected"
	| "reconnecting"
	| "disconnected"
	| "error";

export type NotificationLocalActionStateV2 = "accepted" | "declined" | null;

export interface NotificationItemV2Data {
	id: string;
	eventId?: string;
	username: string;
	type: string;
	status?: string;
	title: string;
	message: string;
	payload?: string | null;
	actionType?: string | null;
	actionRequired: boolean;
	actionCompleted: boolean;
	actionUrl?: string | null;
	entityId?: string | null;
	entityType?: string | null;
	actorUsername?: string | null;
	collaborationRequestId?: string | null;
	localActionState: NotificationLocalActionStateV2;
	createdAt: string;
	read: boolean;
}

export interface NotificationSocketPayloadV2 {
	id: string;
	eventId?: string;
	username: string;
	type: string;
	status?: string;
	title?: string;
	message?: string;
	payload?: string;
	actionType?: string | null;
	actionRequired?: boolean;
	actionCompleted?: boolean;
	actionUrl?: string | null;
	entityId?: string | null;
	entityType?: string | null;
	actorUsername?: string | null;
	collaborationRequestId?: string | null;
	createdAt: string;
}

export interface NotificationFeedPageV2 {
	items: NotificationItemV2Data[];
	page: number;
	hasMore: boolean;
}

export interface NotificationCenterStateV2 {
	notifications: NotificationItemV2Data[];
	contextualNotifications: NotificationItemV2Data[];
	unreadCount: number;
	connectionState: NotificationConnectionStateV2;
	isInitialLoading: boolean;
	isLoadingMore: boolean;
	error: string | null;
	hasMore: boolean;
	nextPage: number;
	hasLoadedOnce: boolean;
}
