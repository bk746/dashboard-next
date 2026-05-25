import type {
  AuditVisuelRecord,
  Prospect,
  ProspectDatesAppels,
  ProspectEtapeContact,
  ProspectNote,
  ProspectRelanceCanal,
  ProspectReponseClient,
} from "@/app/types";

export function removeProspectAuditBucket(list: AuditVisuelRecord[], prospectId: string): AuditVisuelRecord[] {
  return list.filter((a) => a.id !== `prospect-${prospectId}`);
}

export const RELANCE_DELAI_JOURS_OUVRES = 3;

export const ETAPES_CONTACT: { value: ProspectEtapeContact; label: string; emoji: string }[] = [
  { value: "aucun", label: "Aucun", emoji: "—" },
  { value: "appel_passe", label: "Appel passé", emoji: "📞" },
  { value: "appel_passe_2", label: "2ème appel passé", emoji: "📞" },
  { value: "appel_passe_3", label: "3ème appel passé", emoji: "📞" },
  { value: "appel_passe_4", label: "4ème appel passé", emoji: "📞" },
];

const ETAPES_CONTACT_VALIDES = new Set<string>(ETAPES_CONTACT.map((e) => e.value));

export function numeroAppelEtape(etape: ProspectEtapeContact): 0 | 1 | 2 | 3 | 4 {
  switch (etape) {
    case "appel_passe":
      return 1;
    case "appel_passe_2":
      return 2;
    case "appel_passe_3":
      return 3;
    case "appel_passe_4":
      return 4;
    default:
      return 0;
  }
}

export function normaliserDatesAppels(p: Prospect): ProspectDatesAppels {
  const d = p.datesAppels ?? {};
  const legacy = p.dateAppelPasse?.trim() || p.dateMailEnvoye?.trim();
  return {
    appel1: d.appel1?.trim() || legacy || undefined,
    appel2: d.appel2?.trim() || undefined,
    appel3: d.appel3?.trim() || undefined,
    appel4: d.appel4?.trim() || undefined,
  };
}

export function getDateAppel(p: Prospect, n: 1 | 2 | 3 | 4): string | undefined {
  const d = normaliserDatesAppels(p);
  switch (n) {
    case 1:
      return d.appel1;
    case 2:
      return d.appel2;
    case 3:
      return d.appel3;
    case 4:
      return d.appel4;
  }
}

export function patchDateAppel(prev: Prospect, n: 1 | 2 | 3 | 4, date: string | undefined): Partial<Prospect> {
  const d = normaliserDatesAppels(prev);
  const key = `appel${n}` as keyof ProspectDatesAppels;
  return {
    datesAppels: {
      ...d,
      [key]: date?.trim() || undefined,
    },
  };
}

function migrateEtapeContact(p: Prospect): Prospect {
  let etape = p.etapeContact as string;
  const dates = normaliserDatesAppels(p);

  if (etape === "audit_envoye") {
    etape = "aucun";
  } else if (etape === "mail_envoye") {
    etape = "appel_passe";
    if (!dates.appel1 && p.dateMailEnvoye?.trim()) dates.appel1 = p.dateMailEnvoye.trim();
  } else if (!ETAPES_CONTACT_VALIDES.has(etape)) {
    etape = "aucun";
  }

  const { dateMailEnvoye: _m, dateAppelPasse: _a, ...rest } = p;
  return {
    ...rest,
    etapeContact: etape as ProspectEtapeContact,
    datesAppels: dates,
  };
}

export const REPONSES_CLIENT: { value: ProspectReponseClient; label: string; emoji: string }[] = [
  { value: "en_attente", label: "En attente", emoji: "⏳" },
  { value: "valide", label: "Validé", emoji: "✅" },
  { value: "refuse", label: "Refusé", emoji: "❌" },
];

export const NOTE_TYPES: { value: ProspectNote["type"]; label: string }[] = [
  { value: "mail", label: "Mail" },
  { value: "appel", label: "Appel" },
  { value: "audit", label: "Audit personnalisé" },
  { value: "relance_mail", label: "Relance mail" },
  { value: "relance_appel", label: "Relance appel" },
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
function parseDateISO(dateStr: string): Date | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const t = new Date(y, m, day);
  return isNaN(t.getTime()) ? null : t;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isWeekendDate(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Ajoute N jours ouvrés (lun–ven) à une date yyyy-mm-dd. */
export function addBusinessDaysToDateISO(dateStr: string, businessDays: number): string | null {
  const start = parseDateISO(dateStr);
  if (!start || businessDays <= 0) return businessDays === 0 ? dateStr : null;
  const cur = new Date(start);
  let added = 0;
  while (added < businessDays) {
    cur.setDate(cur.getDate() + 1);
    if (!isWeekendDate(cur)) added++;
  }
  return formatDateISO(cur);
}

/** Date limite atteinte ou dépassée (comparaison calendaire au jour près). */
export function dateISOEstPasseeOuAujourdhui(dateStr: string | undefined): boolean {
  const j = joursDepuisDateISO(dateStr);
  return j !== null && j >= 0;
}

/** Au moins un appel passé selon le statut contact (pas les anciennes dates seules). */
export function aEuPremierAppel(p: Prospect): boolean {
  return numeroAppelEtape(p.etapeContact) >= 1;
}

/** Première relance : 3 jours ouvrés après la date du 1er appel (pas après l’audit). */
export function datePremiereRelanceApresPremierAppel(p: Prospect): string | undefined {
  const ref = getDateAppel(p, 1);
  if (!ref) return undefined;
  return addBusinessDaysToDateISO(ref, RELANCE_DELAI_JOURS_OUVRES) ?? undefined;
}

/** Date à laquelle la prochaine relance doit être faite. */
export function dateEffectiveProchaineRelance(p: Prospect): string | undefined {
  if (!aEuPremierAppel(p)) return undefined;
  if (p.dateProchaineRelance?.trim()) return p.dateProchaineRelance.trim();
  if (!p.relancesSansReponse?.length) return datePremiereRelanceApresPremierAppel(p);
  return undefined;
}

export function patchRelanceSansReponse(
  prev: Prospect,
  canal: ProspectRelanceCanal,
  date?: string
): Partial<Prospect> {
  const d = date?.trim() || todayDateISO();
  const next = addBusinessDaysToDateISO(d, RELANCE_DELAI_JOURS_OUVRES);
  return {
    relancesSansReponse: [...(prev.relancesSansReponse ?? []), { date: d, canal }],
    dateProchaineRelance: next ?? undefined,
  };
}

function migrateRelanceFields(p: Prospect): Prospect {
  let relancesSansReponse = p.relancesSansReponse ?? [];
  let dateProchaineRelance = p.dateProchaineRelance;

  if (p.etapeContact === "aucun") {
    dateProchaineRelance = undefined;
  }

  if (p.etapeContact !== "aucun" && p.dateRelanceMailEnvoye?.trim()) {
    const exists = relancesSansReponse.some(
      (r) => r.date === p.dateRelanceMailEnvoye && r.canal === "mail"
    );
    if (!exists) {
      relancesSansReponse = [
        ...relancesSansReponse,
        { date: p.dateRelanceMailEnvoye!, canal: "mail" as const },
      ];
    }
    if (!dateProchaineRelance) {
      dateProchaineRelance =
        addBusinessDaysToDateISO(p.dateRelanceMailEnvoye, RELANCE_DELAI_JOURS_OUVRES) ?? undefined;
    }
  }

  const dateAppel1 = getDateAppel(p, 1);
  if (p.etapeContact !== "aucun" && p.relanceAppelSemaineFait && dateAppel1) {
    const exists = relancesSansReponse.some((r) => r.date === dateAppel1 && r.canal === "appel");
    if (!exists) {
      relancesSansReponse = [...relancesSansReponse, { date: dateAppel1, canal: "appel" as const }];
    }
    if (!dateProchaineRelance) {
      dateProchaineRelance = addBusinessDaysToDateISO(dateAppel1, RELANCE_DELAI_JOURS_OUVRES) ?? undefined;
    }
  }

  if (!aEuPremierAppel(p)) {
    dateProchaineRelance = undefined;
  }

  if (estReponseClosee(p)) {
    dateProchaineRelance = undefined;
  }

  const {
    relanceMailJ3Fait: _m,
    dateRelanceMailEnvoye: _dm,
    relanceAppelSemaineFait: _a,
    ...rest
  } = p;

  return {
    ...rest,
    relancesSansReponse,
    dateProchaineRelance,
  };
}

export function migrateProspect(raw: Prospect): Prospect {
  let base: Prospect;
  if (raw.etapeContact != null && raw.reponseClient != null) {
    const { statut: _a, ...clean } = raw as Prospect & { statut?: string };
    base = clean as Prospect;
  } else if (raw.etapeContact != null) {
    const { statut: _b, ...rest } = raw as Prospect & { statut?: string };
    base = { ...rest, reponseClient: raw.reponseClient ?? "en_attente" } as Prospect;
  } else {
    const old = raw.statut as string | undefined;
    let etape: ProspectEtapeContact = "aucun";
    let reponse: ProspectReponseClient = "en_attente";

    switch (old) {
      case "mail_envoye":
        etape = "appel_passe";
        break;
      case "appel_effectue":
        etape = "appel_passe";
        break;
      case "audit_envoye":
        etape = "aucun";
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
        etape = "aucun";
        reponse = "en_attente";
        break;
    }

    const { statut: _s, ...rest } = raw;
    base = {
      ...rest,
      etapeContact: etape,
      reponseClient: reponse,
    };
  }
  return migrateRelanceFields(migrateEtapeContact(migrateAuditFields(base)));
}

function migrateAuditFields(p: Prospect): Prospect {
  let dateAuditFait = p.dateAuditFait?.trim() || undefined;
  let dateAuditEnvoye = p.dateAuditEnvoye?.trim() || undefined;
  if (!dateAuditFait && p.dateAuditPersoEnvoye?.trim()) {
    dateAuditFait = p.dateAuditPersoEnvoye.trim();
  }
  const { dateAuditPersoEnvoye: _legacy, ...rest } = p;
  return { ...rest, dateAuditFait, dateAuditEnvoye };
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
    return { etapeContact: "aucun", dateProchaineRelance: undefined };
  }
  const n = numeroAppelEtape(nextEtape);
  if (n === 0) return { etapeContact: nextEtape };
  const t = todayDateISO();
  const d = normaliserDatesAppels(prev);
  const key = `appel${n}` as keyof ProspectDatesAppels;
  if (!d[key]) d[key] = t;
  return { etapeContact: nextEtape, datesAppels: d };
}

/** Date (yyyy-mm-dd) de l’appel correspondant au statut contact en cours. */
export function dateEtapeEnCours(p: Prospect): string | undefined {
  const n = numeroAppelEtape(p.etapeContact);
  if (n === 0) return undefined;
  return getDateAppel(p, n);
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

/** Audit réalisé (suivi interne, date renseignée). */
export function auditPersonnaliseFait(p: Prospect): boolean {
  return !!(p.dateAuditFait?.trim() || p.dateAuditPersoEnvoye?.trim());
}

/** Audit envoyé au prospect. */
export function auditEnvoyeAuProspect(p: Prospect): boolean {
  return !!p.dateAuditEnvoye?.trim();
}

/** @deprecated Alias — audit envoyé au prospect */
export const auditPersonnaliseEnvoye = auditEnvoyeAuProspect;

/** Audit pas encore réalisé (suivi interne) — liste « Audit à faire », hors dossiers clos. */
export function auditPasEncoreEnvoye(p: Prospect): boolean {
  if (estReponseClosee(p)) return false;
  return !auditPersonnaliseFait(p);
}

/** Alias explicite — même logique que auditPasEncoreEnvoye. */
export const auditAFaire = auditPasEncoreEnvoye;

/** Relance à traiter : après le 1er appel, date prévue atteinte (+3 j ouvrés ou sans réponse). */
export function besoinRelance(p: Prospect): boolean {
  if (estReponseClosee(p)) return false;
  if (!aEuPremierAppel(p)) return false;
  const next = dateEffectiveProchaineRelance(p);
  if (!next) return false;
  return dateISOEstPasseeOuAujourdhui(next);
}

export function formatDateISOFr(dateStr: string | undefined): string {
  if (!dateStr?.trim()) return "—";
  const t = parseDateISO(dateStr);
  if (!t) return dateStr;
  return t.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
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
    etapeContact: "aucun",
    reponseClient: "en_attente",
    relancesSansReponse: [],
    dateProchaineRelance: undefined,
    notes: [],
    rdv: [],
    createdAt: now,
    updatedAt: now,
  };
}
