/**
 * Numéro de devis aléatoire (non séquentiel), ex. DEV-482913.
 */
export function generateDevisNumero(existingNumeros: string[]): string {
  for (let attempt = 0; attempt < 80; attempt++) {
    const n = Math.floor(100000 + Math.random() * 900000);
    const num = `DEV-${n}`;
    if (!existingNumeros.includes(num)) return num;
  }
  const fallback = `DEV-${Date.now().toString(36).slice(-6).toUpperCase()}`;
  return existingNumeros.includes(fallback) ? `DEV-${Date.now()}` : fallback;
}
