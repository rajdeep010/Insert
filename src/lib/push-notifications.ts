import { deleteToken, getMessaging, getToken } from "firebase/messaging";
import { app, firebaseConfig, isSupported } from "@/lib/firebase";

const buildServiceWorkerUrl = () => {
    const params = new URLSearchParams({
        apiKey: firebaseConfig.apiKey ?? "",
        authDomain: firebaseConfig.authDomain ?? "",
        projectId: firebaseConfig.projectId ?? "",
        storageBucket: firebaseConfig.storageBucket ?? "",
        messagingSenderId: firebaseConfig.messagingSenderId ?? "",
        appId: firebaseConfig.appId ?? "",
    });

    return `/firebase-messaging-sw.js?${params.toString()}`;
};

const ensurePushSupport = async () => {
    if (!("window" in globalThis)) {
        throw new Error("Push notifications are only available in the browser");
    }

    if (!("Notification" in window)) {
        throw new Error("This browser does not support notifications");
    }

    if (!("serviceWorker" in navigator)) {
        throw new Error("This browser does not support service workers");
    }

    const supported = await isSupported();

    if (!supported) {
        throw new Error("Firebase messaging is not supported in this browser");
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
        throw new Error("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY");
    }

    return vapidKey;
};

export async function enablePushNotifications() {
    const vapidKey = await ensurePushSupport();
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error("Notification permission was not granted");
    }

    const registration = await navigator.serviceWorker.register(buildServiceWorkerUrl());
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
    });

    if (!token) {
        throw new Error("Failed to generate an FCM token");
    }

    return token;
}

export async function disablePushNotifications() {
    if (!("window" in globalThis) || !("serviceWorker" in navigator)) {
        return;
    }

    const supported = await isSupported().catch(() => false);

    if (supported) {
        const messaging = getMessaging(app);
        await deleteToken(messaging).catch(() => false);
    }

    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(
        registrations
            .filter((registration) => registration.active?.scriptURL.includes("/firebase-messaging-sw.js"))
            .map((registration) => registration.unregister())
    );
}