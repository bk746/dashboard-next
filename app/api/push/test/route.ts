import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/supabase/authRequest";
import { sendWebPush } from "@/lib/push/send";
import { isPushConfigured } from "@/lib/push/vapid";

export async function POST(req: Request) {
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push non configuré (clés VAPID)." }, { status: 501 });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Synchronisation cloud non configurée." }, { status: 501 });
  }

  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", user.id)
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!subs?.length) {
    return NextResponse.json({ error: "Aucun appareil abonné." }, { status: 404 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const sub of subs) {
    const result = await sendWebPush(sub, {
      title: "BK Copilot",
      body: "Les notifications fonctionnent — vous recevrez les alertes factures et relances.",
      url: "/parametres",
    });
    if (result.ok) sent++;
    else errors.push(result.error);
  }

  if (sent === 0) {
    return NextResponse.json({ error: errors[0] ?? "Échec envoi." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sent });
}
