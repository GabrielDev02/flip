// Service worker: shows push notifications even when the app is closed.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Gastos", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Gastos", {
      body: data.body,
      icon: "/manifest-icons/192",
      badge: "/manifest-icons/badge",
      tag: data.tag,
      vibrate: [100, 50, 100],
      data: { url: data.url || "/app/home" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/app/home", self.location.origin).href;

  event.waitUntil(
    (async () => {
      // Reuse an open window of the app instead of opening a new one
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin && "focus" in client) {
          await client.focus();
          if ("navigate" in client) await client.navigate(url);
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
