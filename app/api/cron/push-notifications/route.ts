import { NextResponse } from "next/server";
import { runPushNotificationsCron } from "@/lib/push/runCron";

/**
 * Cron Vercel — alertes quotidiennes (factures en retard + relances prospection).
 * Protégé par CRON_SECRET (header Authorization: Bearer …).
 *
 * Variables Vercel requises :
 * - CRON_SECRET
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
 * - SUPABASE_SERVICE_ROLE_KEY
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET manquant." }, { status: 501 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const result = await runPushNotificationsCron();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
