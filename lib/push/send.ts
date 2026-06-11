import webpush from "web-push";
import { configureWebPush } from "@/lib/push/vapid";

export interface PushSubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

export interface PushMessage {
  title: string;
  body: string;
  url?: string;
}

export async function sendWebPush(
  sub: PushSubscriptionRow,
  message: PushMessage
): Promise<{ ok: true } | { ok: false; expired: boolean; error: string }> {
  if (!configureWebPush()) {
    return { ok: false, expired: false, error: "Push non configuré (clés VAPID manquantes)." };
  }

  const payload = JSON.stringify({
    title: message.title,
    body: message.body,
    url: message.url ?? "/dashboard",
  });

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth_key },
      },
      payload
    );
    return { ok: true };
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, expired: status === 404 || status === 410, error: msg };
  }
}
