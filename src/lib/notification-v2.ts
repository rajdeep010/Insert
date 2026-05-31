import type { NotificationItemV2Data, NotificationLocalActionStateV2 } from "@/types/notifications-v2";

export const normalizeNotificationPathV2 = (value?: string | null) => {
	if (!value) return "";
	return value.split("?")[0].split("#")[0].replace(/\/+$/, "").toLowerCase();
};

export const isNotificationActionableV2 = (notification: NotificationItemV2Data) =>
	Boolean(notification.actionRequired && !notification.actionCompleted);

export const doesNotificationMatchPathV2 = (
	notification: NotificationItemV2Data,
	pathname?: string | null
) => {
	if (!pathname || !isNotificationActionableV2(notification)) {
		return false;
	}

	const normalizedPath = normalizeNotificationPathV2(pathname);
	const normalizedActionUrl = normalizeNotificationPathV2(notification.actionUrl);

	if (normalizedActionUrl && normalizedActionUrl === normalizedPath) {
		return true;
	}

	if (notification.entityId) {
		return normalizedPath.includes(String(notification.entityId).toLowerCase());
	}

	return false;
};

export const canOpenNotificationDestinationV2 = (
	notification: NotificationItemV2Data,
	pathname?: string | null
) => {
	const normalizedActionUrl = normalizeNotificationPathV2(notification.actionUrl);
	if (!normalizedActionUrl) {
		return false;
	}

	const normalizedPath = normalizeNotificationPathV2(pathname);
	return normalizedActionUrl !== normalizedPath;
};

export const getNotificationActionKindV2 = (notification: NotificationItemV2Data) => {
	if (!isNotificationActionableV2(notification)) {
		return "none" as const;
	}

	if (notification.actionType === "COLLAB_REQUEST" || notification.actionType === "COLLAB_INVITE") {
		return "binary" as const;
	}

	return "none" as const;
};

export const getNotificationActionLabelV2 = (state: NotificationLocalActionStateV2) => {
	if (state === "accepted") return "Accepted";
	if (state === "declined") return "Declined";
	return null;
};

export const formatNotificationEntityLabelV2 = (entityType?: string | null) => {
	if (!entityType) return null;
	return entityType.replace(/_/g, " ").toLowerCase();
};

