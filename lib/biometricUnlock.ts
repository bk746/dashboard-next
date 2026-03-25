/**
 * Déverrouillage via WebAuthn (Face ID / Touch ID sur iOS Safari, biométrie sur Android).
 * Contexte sécurisé (HTTPS ou localhost) requis.
 */

const STORAGE_KEY = "bk_app_webauthn_cred_id";

export function isWebAuthnAvailable(): boolean {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnAvailable()) return false;
  if (!PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function hasBiometricCredential(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORAGE_KEY);
}

export function clearBiometricCredential(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function getRpId(): string {
  if (typeof window === "undefined") return "localhost";
  return window.location.hostname;
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/** Libellé court selon l’appareil (FR). */
export function getBiometricActionLabel(kind: "unlock" | "activate"): string {
  if (typeof navigator === "undefined") {
    return kind === "unlock" ? "Déverrouiller" : "Activer la biométrie";
  }
  const ua = navigator.userAgent || "";
  const isAppleMobile = /iPhone|iPad|iPod/i.test(ua);
  if (isAppleMobile) {
    return kind === "unlock" ? "Déverrouiller avec Face ID" : "Activer Face ID";
  }
  return kind === "unlock" ? "Déverrouiller avec biométrie" : "Activer la biométrie";
}

/**
 * Enregistre un passkey sur l’authentificateur plateforme (Face ID, Touch ID, etc.).
 */
export async function registerBiometricUnlock(): Promise<boolean> {
  if (!isWebAuthnAvailable()) return false;
  if (hasBiometricCredential()) return true;

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "BK Copilot", id: getRpId() },
        user: { id: userId, name: "bk-local", displayName: "BK Copilot" },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "discouraged",
        },
        timeout: 60000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null;

    if (!credential) return false;
    localStorage.setItem(STORAGE_KEY, arrayBufferToBase64Url(credential.rawId));
    return true;
  } catch {
    return false;
  }
}

/**
 * Vérifie Face ID / biométrie et débloque si la réponse est valide (même origine, même rpId).
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  try {
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: getRpId(),
        allowCredentials: [
          {
            id: new Uint8Array(base64UrlToBuffer(stored)),
            type: "public-key",
            transports: ["internal", "hybrid"],
          },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;

    return assertion !== null;
  } catch {
    return false;
  }
}
