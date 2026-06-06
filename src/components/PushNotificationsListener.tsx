"use client";

import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { app, getMessaging, isSupported } from "@/lib/firebase";

export default function PushNotificationsListener() {
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const registerForegroundListener = async () => {
            if (!("window" in globalThis) || Notification.permission !== "granted") {
                return;
            }

            const supported = await isSupported().catch(() => false);

            if (!supported) {
                return;
            }

            const messaging = getMessaging(app);

            unsubscribe = onMessage(messaging, (payload) => {
                console.log("Received foreground message:", payload);
            });
        };

        void registerForegroundListener();

        return () => {
            unsubscribe?.();
        };
    }, []);

    return null;
}