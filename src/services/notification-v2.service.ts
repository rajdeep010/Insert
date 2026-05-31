import axios from "axios";

import { externalServices } from "@/lib/config/services";
import { getNotificationDestinationUrlV2, getNotificationDisplayMessageV2 } from "@/lib/notification-v2";
import type {
	NotificationFeedPageV2,
	NotificationItemV2Data,
	NotificationLocalActionStateV2,
	NotificationSocketPayloadV2,
} from "@/types/notifications-v2";

export const NOTIFICATION_PAGE_SIZE_V2 = 10;

const notificationClientV2 = axios.create({
	baseURL: externalServices.notificationV2.apiBaseUrl,
	timeout: 10000,
});

const collaborationClientV2 = axios.create({
	baseURL: externalServices.collaboration.apiBaseUrl,
	timeout: 10000,
});

const buildFallbackId = (value: Record<string, unknown>) => {
	const summary = String(value.title ?? value.message ?? value.payload ?? "notification");
	const createdAt = String(value.createdAt ?? Date.now());
	return `${createdAt}-${summary}`;
};

const normalizeLocalActionState = (value: unknown): NotificationLocalActionStateV2 => {
	if (value === "accepted" || value === "declined") {
		return value;
	}
	return null;
};

export const normalizeNotificationV2 = (value: Record<string, unknown>): NotificationItemV2Data => {
	const normalized: NotificationItemV2Data = {
		id: String(value.id ?? value._id ?? value.eventId ?? buildFallbackId(value)),
		eventId: value.eventId ? String(value.eventId) : undefined,
		username: String(value.username ?? value.to ?? ""),
		type: String(value.type ?? value.noti_type ?? "INFO"),
		status: value.status ? String(value.status) : undefined,
		title: String(value.title ?? value.type ?? "Notification"),
		message: String(value.message ?? value.payload ?? ""),
		payload: value.payload ? String(value.payload) : null,
		actionType: value.actionType ? String(value.actionType) : null,
		actionRequired: Boolean(value.actionRequired),
		actionCompleted: Boolean(value.actionCompleted),
		actionUrl: value.actionUrl ? String(value.actionUrl) : null,
		entityId: value.entityId ? String(value.entityId) : null,
		entityType: value.entityType ? String(value.entityType) : null,
		actorUsername: value.actorUsername ? String(value.actorUsername) : null,
		collaborationRequestId: value.collaborationRequestId ? String(value.collaborationRequestId) : null,
		localActionState: normalizeLocalActionState(value.localActionState),
		createdAt: String(value.createdAt ?? new Date().toISOString()),
		read: Boolean(value.read),
	};

	return {
		...normalized,
		message: getNotificationDisplayMessageV2(normalized),
		actionUrl: getNotificationDestinationUrlV2(normalized) ?? normalized.actionUrl,
	};
};

const extractFeedSource = (payload: any) => {
	if (payload?.data?.content) return payload.data;
	if (payload?.content) return payload;
	if (payload?.data?.notifications) return { content: payload.data.notifications, number: payload.data.page ?? 0, last: payload.data.last };
	if (payload?.notifications) return { content: payload.notifications, number: payload.page ?? 0, last: payload.last };
	if (Array.isArray(payload?.data)) return { content: payload.data, number: 0, last: payload.data.length === 0 };
	if (Array.isArray(payload)) return { content: payload, number: 0, last: payload.length === 0 };
	return { content: [], number: 0, last: true };
};

const resolveHasMore = (source: any, currentPage: number, size: number, itemsLength: number) => {
	if (typeof source?.last === "boolean") return !source.last;
	if (typeof source?.totalPages === "number") return currentPage + 1 < source.totalPages;
	return itemsLength >= size;
};

export const fetchNotificationsPageV2 = async ({
	username,
	page,
	size = NOTIFICATION_PAGE_SIZE_V2,
	sort = "createdAt,desc",
}: {
	username: string;
	page: number;
	size?: number;
	sort?: string;
}): Promise<NotificationFeedPageV2> => {
	const response = await notificationClientV2.get("/notifications", {
		params: { username, page, size, sort },
	});

	const source = extractFeedSource(response.data);
	const items = Array.isArray(source.content)
		? source.content.map((item: Record<string, unknown>) => normalizeNotificationV2(item))
		: [];
	const currentPage = typeof source.number === "number" ? source.number : page;

	return {
		items,
		page: currentPage,
		hasMore: resolveHasMore(source, currentPage, size, items.length),
	};
	};

export const fetchUnreadCountV2 = async (username: string): Promise<number> => {
	const response = await notificationClientV2.get("/notifications/unread-count", {
		params: { username },
	});

	return Number(response.data?.data?.count ?? response.data?.count ?? 0);
};

export const markNotificationAsReadV2 = async (id: string) => {
	await notificationClientV2.patch(`/notifications/${id}/read`);
};

export const resolveCollaborationInviteV2 = async ({
	collaborationRequestId,
	action,
	accessToken,
}: {
	collaborationRequestId: string;
	action: Exclude<NotificationLocalActionStateV2, null>;
	accessToken?: string | null;
}) => {
	const endpoint = action === "accepted"
		? `/collaborations/${collaborationRequestId}/accept`
		: `/collaborations/${collaborationRequestId}/decline`;

	await collaborationClientV2.post(
		endpoint,
		{},
		{
			headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
		}
	);
};

export const normalizeSocketNotificationV2 = (
	payload: NotificationSocketPayloadV2
): NotificationItemV2Data => ({
	...normalizeNotificationV2(payload as unknown as Record<string, unknown>),
	actionCompleted: Boolean(payload.actionCompleted),
	localActionState: null,
	read: false,
});
