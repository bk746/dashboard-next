import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/supabase/authRequest";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Synchronisation cloud non configurée." }, { status: 501 });
  }

  let endpoint: string | undefined;
  try {
    const body = (await req.json()) as { endpoint?: string };
    endpoint = body.endpoint?.trim();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint manquant." }, { status: 400 });
  }

  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
