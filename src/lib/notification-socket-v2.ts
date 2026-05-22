import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { externalServices } from "@/lib/config/services";
import type {
	NotificationConnectionStateV2,
	NotificationSocketPayloadV2,
} from "@/types/notifications-v2";

interface CreateNotificationSocketClientV2Options {
	username: string;
	onMessage: (payload: NotificationSocketPayloadV2) => void;
	onConnectionStateChange?: (state: NotificationConnectionStateV2) => void;
	onError?: (error: Error) => void;
}

export const createNotificationSocketClientV2 = ({
	username,
	onMessage,
	onConnectionStateChange,
	onError,
}: CreateNotificationSocketClientV2Options) => {
	let subscription: StompSubscription | null = null;
	let didManualDisconnect = false;

	const client = new Client({
		webSocketFactory: () => new SockJS(externalServices.notificationV2.websocketUrl),
		reconnectDelay: 5000,
		heartbeatIncoming: 10000,
		heartbeatOutgoing: 10000,
		debug: (message) => {
			console.info("[notification-v2:stomp]", message);
		},
	});

	client.onConnect = () => {
		console.info("[notification-v2] connected");
		onConnectionStateChange?.("connected");

		if (subscription) {
			subscription.unsubscribe();
		}

		const destination = `/topic/notifications/${username}`;
		console.info("[notification-v2] subscribing", destination);
		subscription = client.subscribe(destination, (message: IMessage) => {
			try {
				const payload = JSON.parse(message.body) as NotificationSocketPayloadV2;
				onMessage(payload);
			} catch (error) {
				console.error("[notification-v2] message parse failed", error);
				onError?.(error instanceof Error ? error : new Error("Notification payload parsing failed"));
			}
		});
	};

	client.onDisconnect = () => {
		console.info("[notification-v2] disconnected");
		onConnectionStateChange?.("disconnected");
	};

	client.onStompError = (frame) => {
		console.error("[notification-v2] broker error", frame.headers["message"], frame.body);
		onConnectionStateChange?.("error");
		onError?.(new Error(frame.headers["message"] ?? "Notification socket broker error"));
	};

	client.onWebSocketClose = () => {
		if (didManualDisconnect) {
			console.info("[notification-v2] socket closed after cleanup");
			onConnectionStateChange?.("disconnected");
			return;
		}

		console.warn("[notification-v2] socket closed, reconnecting");
		onConnectionStateChange?.("reconnecting");
	};

	return {
		connect: () => {
			didManualDisconnect = false;
			console.info("[notification-v2] connecting", externalServices.notificationV2.websocketUrl);
			onConnectionStateChange?.("connecting");
			client.activate();
		},
		disconnect: async () => {
			didManualDisconnect = true;
			if (subscription) {
				subscription.unsubscribe();
				subscription = null;
			}
			await client.deactivate();
		},
	};
};
