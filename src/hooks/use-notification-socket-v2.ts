"use client";

import { useEffect, useRef, useState } from "react";

import { createNotificationSocketClientV2 } from "@/lib/notification-socket-v2";
import type {
	NotificationConnectionStateV2,
	NotificationSocketPayloadV2,
} from "@/types/notifications-v2";

export const useNotificationSocketV2 = (
	username: string | null,
	onNotification: (payload: NotificationSocketPayloadV2) => void
) => {
	const [connectionState, setConnectionState] = useState<NotificationConnectionStateV2>("idle");
	const notificationHandlerRef = useRef(onNotification);

	useEffect(() => {
		notificationHandlerRef.current = onNotification;
	}, [onNotification]);

	useEffect(() => {
		if (!username) {
			setConnectionState("idle");
			return;
		}

		const socketClient = createNotificationSocketClientV2({
			username,
			onMessage: (payload) => notificationHandlerRef.current(payload),
			onConnectionStateChange: setConnectionState,
			onError: (error) => {
				console.error("[notification-v2] socket error", error);
				setConnectionState("error");
			},
		});

		socketClient.connect();

		return () => {
			void socketClient.disconnect();
		};
	}, [username]);

	return connectionState;
};
