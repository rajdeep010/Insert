"use client";

import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { toast } from "@/components/ui/use-toast";
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
                const title = payload.notification?.title || payload.data?.title || "New notification";
                const body = payload.notification?.body || payload.data?.body || "You have a new message.";

                toast({
                    title,
                    description: body,
                    variant: "default",
                });
            });
        };

        void registerForegroundListener();

        return () => {
            unsubscribe?.();
        };
    }, []);

    return null;
}