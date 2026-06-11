import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/push/vapid";

export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ error: "Notifications push non configurées sur le serveur." }, { status: 501 });
  }
  return NextResponse.json({ publicKey });
}
