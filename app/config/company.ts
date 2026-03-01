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

export const COMPANY_DEFAULT: CompanySettings = {
  denomination: "Keryan Bouzerda",
  siren: "101 354 413",
  siret: "101 354 413 00011",
  codeApe: "62.01Z",
  formeJuridique: "Entrepreneur individuel",
  adresse: "17 ALL Paul Gauguin",
  codePostal: "74600",
  ville: "Annecy",
  pays: "FRANCE",
  email: "keryanbouzerda9@gmail.com",
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
    return { ...COMPANY_DEFAULT, ...parsed };
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
