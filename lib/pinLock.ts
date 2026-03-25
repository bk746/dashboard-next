import { clearBiometricCredential } from "@/lib/biometricUnlock";

/** Hash SHA-256 du code (localStorage) — le code n’est jamais stocké en clair. */
export const PIN_HASH_STORAGE_KEY = "bk_app_pin_hash";

export async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(PIN_HASH_STORAGE_KEY);
  if (!stored) return false;
  const h = await hashPin(pin);
  return h === stored;
}

export async function savePin(pin: string): Promise<void> {
  const h = await hashPin(pin);
  localStorage.setItem(PIN_HASH_STORAGE_KEY, h);
}

export function isPinConfigured(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(PIN_HASH_STORAGE_KEY);
}

export function clearStoredPin(): void {
  localStorage.removeItem(PIN_HASH_STORAGE_KEY);
  clearBiometricCredential();
}
