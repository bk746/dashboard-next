import type {
  Prospect,
  ProspectEtapeContact,
  ProspectNote,
  ProspectReponseClient,
} from "@/app/types";

export const ETAPES_CONTACT: { value: ProspectEtapeContact; label: string; emoji: string }[] = [
  { value: "aucun", label: "Aucun", emoji: "—" },
  { value: "audit_envoye", label: "Audit envoyé", emoji: "📊" },
  { value: "mail_envoye", label: "Mail envoyé", emoji: "📩" },
  { value: "appel_passe", label: "Appel passé", emoji: "📞" },
];

export const REPONSES_CLIENT: { value: ProspectReponseClient; label: string; emoji: string }[] = [
  { value: "en_attente", label: "En attente", emoji: "⏳" },
  { value: "valide", label: "Validé", emoji: "✅" },
  { value: "refuse", label: "Refusé", emoji: "❌" },
];

export const NOTE_TYPES: { value: ProspectNote["type"]; label: string }[] = [
  { value: "mail", label: "Mail" },
  { value: "appel", label: "Appel" },
  { value: "audit", label: "Audit personnalisé" },
  { value: "relance_mail", label: "Relance mail (J+3)" },
  { value: "relance_appel", label: "Relance appel (semaine)" },
  { value: "rdv", label: "RDV / échange" },
  { value: "autre", label: "Autre" },
];

/** Dossier clos côté réponse (plus de relances à prévoir dans ce flux). */
export function estReponseClosee(p: Prospect): boolean {
  return p.reponseClient === "valide" || p.reponseClient === "refuse";
}

/** Prospect encore actif dans le pipe (réponse « en attente » — hors validé / refusé). */
export function prospectEnCours(p: Prospect): boolean {
  return !estReponseClosee(p);
}

/**
 * Normalise les anciennes fiches (champ `statut`) vers `etapeContact` + `reponseClient`.
 * Par défaut la réponse est « en attente » si non renseignée.
 */
export function migrateProspect(raw: Prospect): Prospect {
  if (raw.etapeContact != null && raw.reponseClient != null) {
    const { statut: _a, ...clean } = raw as Prospect & { statut?: string };
    return clean as Prospect;
  }
  if (raw.etapeContact != null) {
    const { statut: _b, ...rest } = raw as Prospect & { statut?: string };
    return { ...rest, reponseClient: raw.reponseClient ?? "en_attente" } as Prospect;
  }

  const old = raw.statut as string | undefined;
  let etape: ProspectEtapeContact = "audit_envoye";
  let reponse: ProspectReponseClient = "en_attente";

  switch (old) {
    case "mail_envoye":
      etape = "mail_envoye";
      break;
    case "appel_effectue":
      etape = "appel_passe";
      break;
    case "audit_envoye":
      etape = "audit_envoye";
      break;
    case "signe":
      reponse = "valide";
      etape = "appel_passe";
      break;
    case "refuse":
    case "echec":
      reponse = "refuse";
      etape = "appel_passe";
      break;
    case "en_discussion":
      reponse = "en_attente";
      etape = "appel_passe";
      break;
    case "non_contacte":
    default:
      etape = "audit_envoye";
      reponse = "en_attente";
      break;
  }

  const { statut: _s, ...rest } = raw;
  return {
    ...rest,
    etapeContact: etape,
    reponseClient: reponse,
  };
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Jours entiers entre date yyyy-mm-dd et aujourd’hui (peut être négatif si date future). */
export function joursDepuisDateISO(dateStr: string | undefined): number | null {
  if (!dateStr?.trim()) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const t = new Date(y, m, day);
  if (isNaN(t.getTime())) return null;
  const diff = startOfDay(new Date()) - startOfDay(t);
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

/** Date locale du jour au format yyyy-mm-dd. */
export function todayDateISO(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Au changement d’étape, préremplit les dates manquantes avec aujourd’hui (modifiables ensuite).
 */
export function patchDatesForEtapeContact(
  prev: Prospect,
  nextEtape: ProspectEtapeContact
): Partial<Prospect> {
  if (nextEtape === "aucun") {
    return {
      etapeContact: "aucun",
      dateAuditPersoEnvoye: undefined,
      dateMailEnvoye: undefined,
      dateAppelPasse: undefined,
    };
  }
  const t = todayDateISO();
  const patch: Partial<Prospect> = { etapeContact: nextEtape };
  if (nextEtape === "audit_envoye") {
    if (!prev.dateAuditPersoEnvoye?.trim()) patch.dateAuditPersoEnvoye = t;
  }
  if (nextEtape === "mail_envoye") {
    if (!prev.dateAuditPersoEnvoye?.trim()) patch.dateAuditPersoEnvoye = t;
    if (!prev.dateMailEnvoye?.trim()) patch.dateMailEnvoye = t;
  }
  if (nextEtape === "appel_passe") {
    if (!prev.dateAuditPersoEnvoye?.trim()) patch.dateAuditPersoEnvoye = t;
    if (!prev.dateMailEnvoye?.trim()) patch.dateMailEnvoye = t;
    if (!prev.dateAppelPasse?.trim()) patch.dateAppelPasse = t;
  }
  return patch;
}

/** Date (yyyy-mm-dd) saisie pour l’étape en cours : audit, mail d’étape ou appel. */
export function dateEtapeEnCours(p: Prospect): string | undefined {
  switch (p.etapeContact) {
    case "aucun":
      return undefined;
    case "audit_envoye":
      return p.dateAuditPersoEnvoye?.trim() || undefined;
    case "mail_envoye":
      return p.dateMailEnvoye?.trim() || undefined;
    case "appel_passe":
      return p.dateAppelPasse?.trim() || undefined;
  }
}

/** Ajoute des jours à une date yyyy-mm-dd, retourne yyyy-mm-dd. */
export function addDaysToDateISO(dateStr: string, days: number): string | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const mo = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const t = new Date(y, mo, d);
  if (isNaN(t.getTime())) return null;
  t.setDate(t.getDate() + days);
  const yy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Date de référence pour l’appel : date du mail de relance, ou à défaut J+3 après l’audit si « mail fait » coché.
 */
export function dateReferenceRelanceMail(p: Prospect): string | undefined {
  if (p.dateRelanceMailEnvoye?.trim()) return p.dateRelanceMailEnvoye;
  if (p.dateMailEnvoye?.trim()) return p.dateMailEnvoye;
  if (p.relanceMailJ3Fait && p.dateAuditPersoEnvoye) {
    return addDaysToDateISO(p.dateAuditPersoEnvoye, 3) ?? undefined;
  }
  return undefined;
}

/** Audit personnalisé pas encore envoyé (pas de date) — hors dossiers clos (validé / refusé). */
export function auditPasEncoreEnvoye(p: Prospect): boolean {
  if (estReponseClosee(p)) return false;
  return !p.dateAuditPersoEnvoye?.trim();
}

/** Après envoi audit perso : mail de relance conseillé à J+3 si pas encore fait. */
export function besoinRelanceMailJ3(p: Prospect): boolean {
  if (!p.dateAuditPersoEnvoye || p.relanceMailJ3Fait) return false;
  if (estReponseClosee(p)) return false;
  const j = joursDepuisDateISO(p.dateAuditPersoEnvoye);
  return j !== null && j >= 3;
}

/** Appel de relance : 7 jours ou plus après l’envoi du mail de relance (date saisie ou J+3 estimé si mail coché). */
export function besoinRelanceAppelSemaine(p: Prospect): boolean {
  if (p.relanceAppelSemaineFait) return false;
  if (estReponseClosee(p)) return false;
  const ref = dateReferenceRelanceMail(p);
  if (!ref) return false;
  const j = joursDepuisDateISO(ref);
  return j !== null && j >= 7;
}

/** Ligne pour afficher un RDV prospect dans le planning (à partir d’aujourd’hui). */
export interface ProspectRdvPlanningRow {
  prospectId: string;
  entreprise: string;
  urgent?: boolean;
  rdvId: string;
  /** ISO datetime */
  debut: string;
  titre?: string;
}

/**
 * Tous les RDV à venir (date/heure ≥ aujourd’hui 00:00), triés du plus proche au plus lointain.
 */
export function listeRendezVousAVenir(prospects: Prospect[]): ProspectRdvPlanningRow[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const t0 = start.getTime();
  const rows: ProspectRdvPlanningRow[] = [];
  for (const p of prospects) {
    for (const r of p.rdv ?? []) {
      const t = new Date(r.debut).getTime();
      if (!isNaN(t) && t >= t0) {
        rows.push({
          prospectId: p.id,
          entreprise: p.entreprise,
          urgent: p.urgent,
          rdvId: r.id,
          debut: r.debut,
          titre: r.titre,
        });
      }
    }
  }
  rows.sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime());
  return rows;
}

/** URL absolue http(s) pour ouvrir le site du prospect, ou null si invalide / vide. */
export function prospectSiteHref(raw: string | undefined | null): string | null {
  const t = raw?.trim();
  if (!t) return null;
  let s = t.replace(/\s/g, "");
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

export function emptyProspect(): Prospect {
  const now = new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    entreprise: "",
    contactNom: "",
    email: "",
    siteWeb: "",
    urgent: false,
    telephone: "",
    etapeContact: "audit_envoye",
    reponseClient: "en_attente",
    dateAuditPersoEnvoye: todayDateISO(),
    relanceMailJ3Fait: false,
    dateRelanceMailEnvoye: undefined,
    relanceAppelSemaineFait: false,
    notes: [],
    rdv: [],
    createdAt: now,
    updatedAt: now,
  };
}
