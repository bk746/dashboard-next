"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import PinPadScreen from "@/components/PinPadScreen";
import {
  authenticateWithBiometric,
  getBiometricActionLabel,
  hasBiometricCredential,
  isPlatformAuthenticatorAvailable,
  registerBiometricUnlock,
} from "@/lib/biometricUnlock";
import { clearStoredPin, isPinConfigured, savePin, verifyPin } from "@/lib/pinLock";
import { ScanFace } from "lucide-react";

const SPLASH_KEY = "bk-copilot-splash-shown";

type SplashPhase = "idle" | "splash" | "exit";

const sf =
  "font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Segoe_UI',sans-serif]";

/**
 * Écran noir « bk copilot » puis code 4 chiffres (style iOS).
 */
export default function EntryGate({ children }: { children: React.ReactNode }) {
  const [splashPhase, setSplashPhase] = useState<SplashPhase>("splash");
  const [unlocked, setUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [setupStep, setSetupStep] = useState<"create" | "confirm">("create");
  const [verifyKey, setVerifyKey] = useState(0);
  const [platformBio, setPlatformBio] = useState(false);
  const [hasBioCred, setHasBioCred] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const firstPinRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    setHasPin(isPinConfigured());
    setHasBioCred(hasBiometricCredential());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    void isPlatformAuthenticatorAvailable().then(setPlatformBio);
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SPLASH_KEY)) {
        setSplashPhase("idle");
        return;
      }
    } catch {
      setSplashPhase("idle");
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      try {
        sessionStorage.setItem(SPLASH_KEY, "1");
      } catch {
        /* ignore */
      }
      setSplashPhase("idle");
      return;
    }
    const id = window.setTimeout(() => setSplashPhase("exit"), 1700);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (splashPhase !== "exit") return;
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SPLASH_KEY, "1");
      } catch {
        /* ignore */
      }
      setSplashPhase("idle");
    }, 480);
    return () => window.clearTimeout(id);
  }, [splashPhase]);

  const handleVerify = useCallback(async (pin: string) => {
    const ok = await verifyPin(pin);
    if (ok) {
      setUnlocked(true);
    } else {
      setVerifyKey((k) => k + 1);
    }
  }, []);

  const tryBiometricUnlock = useCallback(async () => {
    setBioBusy(true);
    try {
      const ok = await authenticateWithBiometric();
      if (ok) setUnlocked(true);
    } finally {
      setBioBusy(false);
    }
  }, []);

  const tryActivateBiometric = useCallback(async () => {
    setBioBusy(true);
    try {
      const ok = await registerBiometricUnlock();
      if (ok) {
        setHasBioCred(true);
        setUnlocked(true);
      }
    } finally {
      setBioBusy(false);
    }
  }, []);

  const handleCreate = useCallback((pin: string) => {
    firstPinRef.current = pin;
    setSetupStep("confirm");
  }, []);

  const handleConfirm = useCallback(async (pin: string) => {
    if (firstPinRef.current === pin) {
      await savePin(pin);
      setHasPin(true);
      setUnlocked(true);
      firstPinRef.current = null;
    } else {
      firstPinRef.current = null;
      setSetupStep("create");
    }
  }, []);

  const showSplash = splashPhase === "splash" || splashPhase === "exit";
  const needSetup = !hasPin;

  /** Ne pas monter le dashboard tant que le code / Face ID n’a pas validé — évite tout flash du contenu. */
  const showApp = unlocked;

  return (
    <>
      {showApp ? children : null}
      {showSplash && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ease-out ${
            splashPhase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={splashPhase === "exit"}
        >
          <p className={`${sf} px-6 text-center text-lg font-medium tracking-tight text-white`}>bk copilot</p>
        </div>
      )}

      {!showSplash && splashPhase === "idle" && !unlocked && (
        <div
          className={`${sf} fixed inset-0 z-[9998] flex min-h-[100dvh] flex-col items-center justify-center bg-black px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-12`}
        >
          <div className="flex flex-1 flex-col items-center justify-center">
            {needSetup ? (
              setupStep === "create" ? (
                <PinPadScreen
                  key="create"
                  variant="fullscreen"
                  title="Créer un code"
                  subtitle="Choisis quatre chiffres pour cet appareil."
                  onComplete={handleCreate}
                />
              ) : (
                <PinPadScreen
                  key="confirm"
                  variant="fullscreen"
                  title="Confirmer le code"
                  subtitle="Saisis à nouveau les quatre chiffres."
                  onComplete={handleConfirm}
                />
              )
            ) : (
              <PinPadScreen
                key={verifyKey}
                variant="fullscreen"
                title="Entrer le code"
                subtitle="Quatre chiffres — comme sur iPhone."
                onComplete={(pin) => void handleVerify(pin)}
              />
            )}
          </div>

          {!needSetup && (
            <div className="mt-auto flex flex-col items-center gap-5 pb-10 pt-6">
              {platformBio && hasBioCred ? (
                <button
                  type="button"
                  disabled={bioBusy}
                  onClick={() => void tryBiometricUnlock()}
                  className="flex items-center gap-2 text-[15px] font-normal text-[#0A84FF] transition-opacity hover:opacity-80 active:opacity-60 disabled:opacity-40"
                >
                  <ScanFace className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
                  {getBiometricActionLabel("unlock")}
                </button>
              ) : null}
              {platformBio && !hasBioCred ? (
                <button
                  type="button"
                  disabled={bioBusy}
                  onClick={() => void tryActivateBiometric()}
                  className="flex items-center gap-2 text-[15px] font-normal text-[#0A84FF] transition-opacity hover:opacity-80 active:opacity-60 disabled:opacity-40"
                >
                  <ScanFace className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
                  {getBiometricActionLabel("activate")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm("Réinitialiser le code ? Tu devras en créer un nouveau.")
                  ) {
                    clearStoredPin();
                    setHasPin(false);
                    setHasBioCred(false);
                    setSetupStep("create");
                    setUnlocked(false);
                    firstPinRef.current = null;
                  }
                }}
                className="text-[15px] font-normal text-[#0A84FF] transition-opacity hover:opacity-80 active:opacity-60"
              >
                Code oublié ?
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
