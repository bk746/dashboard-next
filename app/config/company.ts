/**
 * Informations de l'entreprise (émetteur des devis et factures).
 * Les valeurs par défaut sont surchargées par les paramètres (localStorage) si présents.
 */

export interface CompanySettings {
  denomination: string;
  siren: string;
  siret: string;
  codeApe: string;
  formeJuridique: string;
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
  email: string;
  telephone: string;
  tva: string;
  dateImmatriculation: string;
  departement: string;
}

/** Anciennes valeurs remplacées automatiquement par « Vallerio Studio » (affichage + fusion). */
const LEGACY_DENOMINATIONS = new Set(["Keryan Bouzerda", "Vallerio Sution"]);

export function normalizeCompanyDenomination(denomination: string): string {
  if (LEGACY_DENOMINATIONS.has(denomination)) return "Vallerio Studio";
  return denomination;
}

const LEGACY_EMAIL = "keryanbouzerda9@gmail.com";

export function normalizeCompanyEmail(email: string): string {
  if (email === LEGACY_EMAIL) return "hello@valleriostudio.fr";
  return email;
}

/** Ancienne rue supprimée : affichage ville + CP uniquement (74000 Annecy). */
const LEGACY_STREET_LINE = "17 ALL Paul Gauguin";

export function formatCompanyAddressLine(c: CompanySettings): string {
  const street = c.adresse.trim();
  const cityLine = `${c.codePostal} ${c.ville}`.trim();
  const parts = [street, cityLine].filter(Boolean);
  return `${parts.join(", ")} – ${c.pays}`;
}

/** Si l’ancienne adresse était encore enregistrée, on la retire et on aligne le CP. */
export function migrateLegacyCompanyStreet(c: CompanySettings): CompanySettings {
  if (c.adresse.trim() !== LEGACY_STREET_LINE) return c;
  return { ...c, adresse: "", codePostal: "74000" };
}

export const COMPANY_DEFAULT: CompanySettings = {
  denomination: "Vallerio Studio",
  siren: "101 354 413",
  siret: "101 354 413 00011",
  codeApe: "62.01Z",
  formeJuridique: "Entrepreneur individuel",
  adresse: "",
  codePostal: "74000",
  ville: "Annecy",
  pays: "FRANCE",
  email: "hello@valleriostudio.fr",
  telephone: "07 81 99 07 61",
  tva: "TVA non applicable, art. 293 B du CGI",
  dateImmatriculation: "23/02/2026",
  departement: "74 - Haute-Savoie",
};

const STORAGE_KEY = "companySettings";

function loadFromStorage(): CompanySettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CompanySettings>;
    const merged = { ...COMPANY_DEFAULT, ...parsed };
    const withNorm = {
      ...merged,
      denomination: normalizeCompanyDenomination(merged.denomination),
      email: normalizeCompanyEmail(merged.email),
    };
    return migrateLegacyCompanyStreet(withNorm);
  } catch {
    return null;
  }
}

export function getCompany(): CompanySettings {
  if (typeof window === "undefined") return COMPANY_DEFAULT;
  return loadFromStorage() ?? COMPANY_DEFAULT;
}

export function saveCompany(data: CompanySettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Pour compatibilité avec les composants qui importent COMPANY */
export const COMPANY = COMPANY_DEFAULT;
