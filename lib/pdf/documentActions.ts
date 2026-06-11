"use client";

/**
 * Actions client sur les documents (devis / factures) :
 * téléchargement PDF et envoi par email avec pièce jointe.
 * Le module PDF est importé dynamiquement pour ne pas alourdir le bundle.
 */

import type { DocumentPdfData } from "@/lib/pdf/documentPdf";

async function buildPdf(data: DocumentPdfData): Promise<{ blob: Blob; filename: string }> {
  const mod = await import("@/lib/pdf/documentPdf");
  const blob = await mod.generateDocumentPdfBlob(data);
  return { blob, filename: mod.documentPdfFilename(data) };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Télécharge le PDF du document. */
export async function downloadDocumentPdf(data: DocumentPdfData): Promise<void> {
  const { blob, filename } = await buildPdf(data);
  triggerDownload(blob, filename);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export interface SendDocumentEmailParams {
  data: DocumentPdfData;
  to: string;
  subject: string;
  body: string;
}

export type SendDocumentResult =
  | { status: "sent" }
  | { status: "fallback_mailto"; reason: string }
  | { status: "error"; message: string };

/**
 * Envoie le document par email (API Resend) avec le PDF en pièce jointe.
 * Si l'API n'est pas configurée (pas de RESEND_API_KEY), télécharge le PDF
 * et ouvre le client mail (mailto) — l'utilisateur joint le fichier lui-même.
 */
export async function sendDocumentByEmail(params: SendDocumentEmailParams): Promise<SendDocumentResult> {
  const { data, to, subject, body } = params;
  const { blob, filename } = await buildPdf(data);

  try {
    const res = await fetch("/api/send-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject,
        text: body,
        filename,
        pdfBase64: await blobToBase64(blob),
        replyTo: data.company.email || undefined,
      }),
    });

    if (res.ok) return { status: "sent" };

    if (res.status === 501) {
      // Service email non configuré → fallback manuel.
      triggerDownload(blob, filename);
      openMailto(to, subject, body);
      return { status: "fallback_mailto", reason: "Service email non configuré" };
    }

    const payload = (await res.json().catch(() => null)) as { error?: string } | null;
    return { status: "error", message: payload?.error ?? `Erreur ${res.status}` };
  } catch {
    triggerDownload(blob, filename);
    openMailto(to, subject, body);
    return { status: "fallback_mailto", reason: "API injoignable" };
  }
}

function openMailto(to: string, subject: string, body: string) {
  const base = to ? `mailto:${encodeURIComponent(to)}` : "mailto:";
  window.location.href = `${base}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    `${body}\n\n(Le PDF vient d'être téléchargé — pensez à le joindre à ce mail.)`
  )}`;
}
