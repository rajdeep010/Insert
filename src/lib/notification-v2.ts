import { externalServices } from "@/lib/config/services";
import type {
	NotificationActionResultV2,
	NotificationItemV2Data,
	NotificationLocalActionStateV2,
} from "@/types/notifications-v2";

const isAbsoluteUrlV2 = (value: string) => /^https?:\/\//i.test(value);

const ensureLeadingSlashV2 = (value: string) => (value.startsWith("/") ? value : `/${value}`);

const toNormalizedUrlV2 = (value?: string | null) => {
	if (!value) return null;

	try {
		if (isAbsoluteUrlV2(value)) {
			return new URL(value);
		}

		return new URL(ensureLeadingSlashV2(value), externalServices.app.origin);
	} catch {
		return null;
	}
};

export const normalizeNotificationPathV2 = (value?: string | null) => {
	if (!value) return "";

	const normalizedUrl = toNormalizedUrlV2(value);
	if (normalizedUrl) {
		return normalizedUrl.pathname.replace(/\/+$/, "").toLowerCase();
	}

	return value.split("?")[0].split("#")[0].replace(/\/+$/, "").toLowerCase();
};

export const getNotificationActorPathV2 = (actorUsername?: string | null) => {
	if (!actorUsername) return null;
	return `/u/${actorUsername}`;
};

export const getNotificationActorUrlV2 = (actorUsername?: string | null) => {
	const actorPath = getNotificationActorPathV2(actorUsername);
	return actorPath ? new URL(actorPath, externalServices.app.origin).toString() : null;
};

const getNotificationEntityPathV2 = (notification: NotificationItemV2Data) => {
	if (!notification.entityId || !notification.entityType) return null;

	switch (notification.entityType.toUpperCase()) {
		case "TOPIC":
			return `/topic/${notification.entityId}`;
		case "BLOG":
			return `/blog/${notification.entityId}`;
		default:
			return null;
	}
};

const isNotificationFallbackPathV2 = (value?: string | null) => normalizeNotificationPathV2(value) === "/notifications";

export const getNotificationDestinationPathV2 = (notification: NotificationItemV2Data) => {
	const derivedEntityPath = getNotificationEntityPathV2(notification);
	const normalizedActionUrl = toNormalizedUrlV2(notification.actionUrl);
	const actionPath = normalizedActionUrl
		? `${normalizedActionUrl.pathname}${normalizedActionUrl.search}${normalizedActionUrl.hash}`
		: notification.actionUrl
			? ensureLeadingSlashV2(notification.actionUrl)
			: null;

	if (derivedEntityPath && (!actionPath || isNotificationFallbackPathV2(actionPath))) {
		return derivedEntityPath;
	}

	if (actionPath && !isNotificationFallbackPathV2(actionPath)) {
		return actionPath;
	}

	return getNotificationActorPathV2(notification.actorUsername);
};

export const getNotificationDestinationUrlV2 = (notification: NotificationItemV2Data) => {
	const destinationPath = getNotificationDestinationPathV2(notification);
	return destinationPath ? new URL(destinationPath, externalServices.app.origin).toString() : null;
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
	const normalizedActionUrl = normalizeNotificationPathV2(getNotificationDestinationPathV2(notification));

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
	const normalizedActionUrl = normalizeNotificationPathV2(getNotificationDestinationPathV2(notification));
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

export const getNotificationResolvedActionStateV2 = (notification: NotificationItemV2Data): NotificationLocalActionStateV2 => {
	if (notification.actionResult === "ACCEPTED") {
		return "accepted";
	}

	if (notification.actionResult === "DECLINED") {
		return "declined";
	}

	return notification.localActionState;
};

export const getNotificationDisplayMessageV2 = (notification: NotificationItemV2Data) => {
	const actorUsername = notification.actorUsername;
	const entityLabel = formatNotificationEntityLabelV2(notification.entityType);
	const resolvedActionState = getNotificationResolvedActionStateV2(notification);

	if (notification.actionType === "COLLAB_REQUEST" || notification.actionType === "COLLAB_INVITE") {
		if (resolvedActionState === "accepted" && actorUsername) {
			return `You accepted ${actorUsername}'s collaboration invite.`;
		}

		if (resolvedActionState === "declined" && actorUsername) {
			return `You declined ${actorUsername}'s collaboration invite.`;
		}

		if (actorUsername && entityLabel) {
			return `${actorUsername} invited you to collaborate on this ${entityLabel}.`;
		}

		if (actorUsername) {
			return `${actorUsername} invited you to collaborate.`;
		}
	}

	return notification.message || notification.payload || notification.title;
};

export const getNotificationDestinationLabelV2 = (notification: NotificationItemV2Data) => {
	const entityLabel = formatNotificationEntityLabelV2(notification.entityType);
	if (entityLabel) {
		return `Open ${entityLabel}`;
	}

	if (notification.actorUsername) {
		return `View @${notification.actorUsername}`;
	}

	return "Open destination";
};

export const formatNotificationEntityLabelV2 = (entityType?: string | null) => {
	if (!entityType) return null;
	return entityType.replace(/_/g, " ").toLowerCase();
};

