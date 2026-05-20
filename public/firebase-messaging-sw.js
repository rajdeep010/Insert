importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

const recentNotifications = new Set();

const rememberNotification = (key) => {
    if (!key) return false;
    if (recentNotifications.has(key)) return true;

    recentNotifications.add(key);
    setTimeout(() => {
        recentNotifications.delete(key);
    }, 5000);

    return false;
};

const buildNotificationFromPayload = (payload) => {
    const data = payload?.data ?? {};
    const notification = payload?.notification ?? {};
    const messageId = payload?.messageId || data.messageId || notification.tag || "";

    return {
        messageId,
        title: notification.title || data.title || "Insert",
        options: {
            body: notification.body || data.body || "You have a new notification.",
            icon: data.icon || notification.icon || "/panda-bear.png",
            badge: data.badge || "/panda-bear.png",
            tag: data.tag || messageId || "insert-push",
            requireInteraction: data.requireInteraction === "true",
            data,
        },
    };
};

const showPayloadNotification = async (payload) => {
    const { messageId, title, options } = buildNotificationFromPayload(payload);

    if (rememberNotification(messageId)) {
        return;
    }

    await self.registration.showNotification(title, options);
};

const searchParams = new URL(self.location.href).searchParams;

const firebaseConfig = {
    apiKey: searchParams.get("apiKey"),
    authDomain: searchParams.get("authDomain"),
    projectId: searchParams.get("projectId"),
    storageBucket: searchParams.get("storageBucket"),
    messagingSenderId: searchParams.get("messagingSenderId"),
    appId: searchParams.get("appId"),
};

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log("Background message:", payload);

        void showPayloadNotification(payload);
    });

    self.addEventListener("push", (event) => {
        if (!event.data) {
            return;
        }

        let payload;

        try {
            payload = event.data.json();
        } catch {
            payload = {
                data: {
                    title: "Insert",
                    body: event.data.text(),
                },
            };
        }

        console.log("Raw push event:", payload);
        event.waitUntil(showPayloadNotification(payload));
    });

    self.addEventListener("notificationclick", (event) => {
        event.notification.close();

        const targetUrl = event.notification.data?.url || "/";

        event.waitUntil(
            self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
                for (const client of clientList) {
                    if ("focus" in client) {
                        client.focus();
                        if ("navigate" in client && targetUrl) {
                            return client.navigate(targetUrl);
                        }
                        return client;
                    }
                }

                if (self.clients.openWindow) {
                    return self.clients.openWindow(targetUrl);
                }

                return undefined;
            })
        );
    });
} else {
    console.error("Missing Firebase config in firebase-messaging-sw.js");
}