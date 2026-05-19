importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

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

        const notificationTitle = payload.notification?.title || "Insert";
        const notificationOptions = {
            body: payload.notification?.body || "You have a new notification.",
            icon: "/panda-bear.png",
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.error("Missing Firebase config in firebase-messaging-sw.js");
}