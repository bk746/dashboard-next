/* Handler push — importé par le service worker Workbox (next-pwa). */

self.addEventListener("push", function (event) {
  if (!event.data) return;

  var data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "BK Copilot", body: event.data.text() };
  }

  var title = data.title || "BK Copilot";
  var options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/dashboard" },
    tag: "bk-copilot-alert",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
