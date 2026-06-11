import { NextResponse } from "next/server";

/**
 * Envoi d'un devis / d'une facture par email avec PDF en pièce jointe, via Resend.
 *
 * Configuration (variables d'environnement Vercel) :
 * - RESEND_API_KEY : clé API Resend (https://resend.com) — requis.
 * - RESEND_FROM    : expéditeur, ex. "Vallerio Studio <factures@valleriostudio.fr>"
 *                    (domaine vérifié chez Resend). Défaut : onboarding@resend.dev.
 *
 * Sans RESEND_API_KEY, renvoie 501 → le client bascule sur téléchargement + mailto.
 */

interface SendDocumentBody {
  to: string;
  subject: string;
  text: string;
  filename: string;
  pdfBase64: string;
  replyTo?: string;
}

const MAX_PDF_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Service email non configuré (RESEND_API_KEY manquante)." },
      { status: 501 }
    );
  }

  let body: SendDocumentBody;
  try {
    body = (await req.json()) as SendDocumentBody;
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const to = body.to?.trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Adresse email destinataire invalide." }, { status: 400 });
  }
  if (!body.subject?.trim() || !body.pdfBase64 || !body.filename) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }
  // base64 ≈ 4/3 de la taille binaire
  if (body.pdfBase64.length > (MAX_PDF_BYTES * 4) / 3) {
    return NextResponse.json({ error: "Pièce jointe trop volumineuse." }, { status: 413 });
  }

  const from = process.env.RESEND_FROM || "Vallerio Studio <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: body.subject.trim(),
      text: body.text ?? "",
      reply_to: body.replyTo?.trim() || undefined,
      attachments: [{ filename: body.filename, content: body.pdfBase64 }],
    }),
  });

  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { message?: string } | null;
    return NextResponse.json(
      { error: detail?.message ?? "Échec de l'envoi via Resend." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
