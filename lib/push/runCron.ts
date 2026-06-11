import type { Facture, Prospect } from "@/app/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { computePushDigest, digestKey, formatPushPayload } from "@/lib/push/scanAlerts";
import { sendWebPush } from "@/lib/push/send";
import { isPushConfigured } from "@/lib/push/vapid";

interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  last_notified_at: string | null;
  last_digest: string | null;
}

function parseBucket<T>(payload: unknown, fallback: T): T {
  if (payload == null) return fallback;
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload) as T;
    } catch {
      return fallback;
    }
  }
  return payload as T;
}

/** Envoie les notifications quotidiennes (factures en retard + relances). */
export async function runPushNotificationsCron(): Promise<{
  ok: boolean;
  sent: number;
  skipped: number;
  errors: string[];
}> {
  if (!isPushConfigured()) {
    return { ok: false, sent: 0, skipped: 0, errors: ["Push non configuré (VAPID ou Supabase admin)."] };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { ok: false, sent: 0, skipped: 0, errors: ["Supabase admin indisponible."] };
  }

  const { data: subs, error: subsErr } = await admin.from("push_subscriptions").select("*");
  if (subsErr) {
    return { ok: false, sent: 0, skipped: 0, errors: [subsErr.message] };
  }

  const subscriptions = (subs ?? []) as PushSubscriptionRecord[];
  if (subscriptions.length === 0) {
    return { ok: true, sent: 0, skipped: 0, errors: [] };
  }

  const userIds = [...new Set(subscriptions.map((s) => s.user_id))];
  const errors: string[] = [];
  let sent = 0;
  let skipped = 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  for (const userId of userIds) {
    const { data: buckets } = await admin
      .from("data_buckets")
      .select("bucket_key, payload")
      .eq("user_id", userId)
      .in("bucket_key", ["factures", "prospection"]);

    const factures = parseBucket<Facture[]>(
      buckets?.find((b) => b.bucket_key === "factures")?.payload,
      []
    );
    const prospects = parseBucket<Prospect[]>(
      buckets?.find((b) => b.bucket_key === "prospection")?.payload,
      []
    );

    const digest = computePushDigest(factures, prospects);
    if (!digest) {
      skipped += subscriptions.filter((s) => s.user_id === userId).length;
      continue;
    }

    const key = digestKey(digest);
    const payload = formatPushPayload(digest);
    const userSubs = subscriptions.filter((s) => s.user_id === userId);

    for (const sub of userSubs) {
      const alreadyToday =
        sub.last_digest === key &&
        sub.last_notified_at &&
        new Date(sub.last_notified_at).getTime() >= todayStart.getTime();

      if (alreadyToday) {
        skipped++;
        continue;
      }

      const result = await sendWebPush(sub, payload);
      if (result.ok) {
        sent++;
        await admin
          .from("push_subscriptions")
          .update({
            last_notified_at: new Date().toISOString(),
            last_digest: key,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.id);
      } else if (result.expired) {
        await admin.from("push_subscriptions").delete().eq("id", sub.id);
        errors.push(`Abonnement expiré supprimé (${sub.id.slice(0, 8)}…)`);
      } else {
        errors.push(result.error);
      }
    }
  }

  return { ok: true, sent, skipped, errors };
}
