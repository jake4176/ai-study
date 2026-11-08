self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const fallback = { title: "결제일", body: "구독 결제일이 되었습니다.", url: "/?tab=alerts" };
  let payload = fallback;
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = {
        title: typeof parsed.title === "string" ? parsed.title : fallback.title,
        body: typeof parsed.body === "string" ? parsed.body : fallback.body,
        url: typeof parsed.url === "string" && parsed.url.startsWith("/") && !parsed.url.startsWith("//") ? parsed.url : fallback.url,
      };
    }
  } catch {
    payload = fallback;
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data?.url;
  const path = typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/?tab=alerts";
  const target = new URL(path, self.location.origin).href;
  event.waitUntil(self.clients.openWindow(target));
});
