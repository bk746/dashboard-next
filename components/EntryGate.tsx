"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import PinPadScreen from "@/components/PinPadScreen";
import {
  authenticateWithBiometric,
  detectBiometricKind,
  getBiometricActionLabel,
  getBiometricHint,
  hasBiometricCredential,
  isPlatformAuthenticatorAvailable,
  registerBiometricUnlock,
} from "@/lib/biometricUnlock";
import { clearStoredPin, isPinConfigured, savePin, verifyPin } from "@/lib/pinLock";
import { Fingerprint, ScanFace } from "lucide-react";

const SPLASH_KEY = "bk-copilot-splash-shown";

type SplashPhase = "idle" | "splash" | "exit";

const sf =
  "font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Segoe_UI',sans-serif]";

function BiometricIcon({ className }: { className?: string }) {
  const kind = detectBiometricKind();
  if (kind === "touchId") {
    return <Fingerprint className={className} strokeWidth={1.5} aria-hidden />;
  }
  return <ScanFace className={className} strokeWidth={1.5} aria-hidden />;
}

/**
 * Écran noir « bk copilot » puis code 4 chiffres ou Touch ID / Face ID.
 */
export default function EntryGate({ children }: { children: React.ReactNode }) {
  const [splashPhase, setSplashPhase] = useState<SplashPhase>("splash");
  const [unlocked, setUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [setupStep, setSetupStep] = useState<"create" | "confirm">("create");
  const [showBioSetup, setShowBioSetup] = useState(false);
  const [verifyKey, setVerifyKey] = useState(0);
  const [platformBio, setPlatformBio] = useState(false);
  const [hasBioCred, setHasBioCred] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const firstPinRef = useRef<string | null>(null);
  const bioAutoAttempted = useRef(false);

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
    setBioError(null);
    try {
      const ok = await authenticateWithBiometric();
      if (ok) {
        setUnlocked(true);
      } else {
        setBioError("Authentification annulée ou refusée.");
      }
    } finally {
      setBioBusy(false);
    }
  }, []);

  const tryActivateBiometric = useCallback(async () => {
    setBioBusy(true);
    setBioError(null);
    try {
      const ok = await registerBiometricUnlock();
      if (ok) {
        setHasBioCred(true);
        setShowBioSetup(false);
        setUnlocked(true);
      } else {
        setBioError("Impossible d’activer la biométrie. Réessaie ou utilise le code.");
      }
    } finally {
      setBioBusy(false);
    }
  }, []);

  const handleCreate = useCallback((pin: string) => {
    firstPinRef.current = pin;
    setSetupStep("confirm");
  }, []);

  const handleConfirm = useCallback(
    async (pin: string) => {
      if (firstPinRef.current === pin) {
        await savePin(pin);
        setHasPin(true);
        firstPinRef.current = null;
        const bioOk = await isPlatformAuthenticatorAvailable();
        if (bioOk) {
          setShowBioSetup(true);
        } else {
          setUnlocked(true);
        }
      } else {
        firstPinRef.current = null;
        setSetupStep("create");
      }
    },
    []
  );

  const showSplash = splashPhase === "splash" || splashPhase === "exit";
  const needSetup = !hasPin;
  const showApp = unlocked;

  const lockScreenVisible =
    !showSplash && splashPhase === "idle" && !unlocked && !showBioSetup;

  useEffect(() => {
    if (!lockScreenVisible || needSetup || !platformBio || !hasBioCred || bioAutoAttempted.current) {
      return;
    }
    bioAutoAttempted.current = true;
    void tryBiometricUnlock();
  }, [lockScreenVisible, needSetup, platformBio, hasBioCred, tryBiometricUnlock]);

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

      {showBioSetup && (
        <div
          className={`${sf} fixed inset-0 z-[9998] flex min-h-[100dvh] flex-col items-center justify-center bg-black px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]`}
        >
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
              <BiometricIcon className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-white">{getBiometricActionLabel("activate")} ?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{getBiometricHint()}</p>
            {bioError ? (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {bioError}
              </p>
            ) : null}
          </div>
          <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
            <button
              type="button"
              disabled={bioBusy}
              onClick={() => void tryActivateBiometric()}
              className="rounded-2xl bg-[#0A84FF] px-6 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {bioBusy ? "En attente…" : getBiometricActionLabel("activate")}
            </button>
            <button
              type="button"
              disabled={bioBusy}
              onClick={() => {
                setShowBioSetup(false);
                setUnlocked(true);
              }}
              className="py-2 text-[15px] font-normal text-white/50 transition-opacity hover:text-white/70"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {lockScreenVisible && (
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
                  onComplete={(pin) => void handleConfirm(pin)}
                />
              )
            ) : (
              <PinPadScreen
                key={verifyKey}
                variant="fullscreen"
                title="Entrer le code"
                subtitle="Quatre chiffres — ou utilise Touch ID ci-dessous."
                onComplete={(pin) => void handleVerify(pin)}
              />
            )}
          </div>

          {!needSetup && (
            <div className="mt-auto flex flex-col items-center gap-4 pb-10 pt-6">
              {bioError ? (
                <p className="max-w-xs text-center text-sm text-red-400" role="alert">
                  {bioError}
                </p>
              ) : null}
              {platformBio && hasBioCred ? (
                <button
                  type="button"
                  disabled={bioBusy}
                  onClick={() => void tryBiometricUnlock()}
                  className="flex items-center gap-2 text-[15px] font-normal text-[#0A84FF] transition-opacity hover:opacity-80 active:opacity-60 disabled:opacity-40"
                >
                  <BiometricIcon className="h-5 w-5 shrink-0" />
                  {bioBusy ? "Vérification…" : getBiometricActionLabel("unlock")}
                </button>
              ) : null}
              {platformBio && !hasBioCred ? (
                <button
                  type="button"
                  disabled={bioBusy}
                  onClick={() => void tryActivateBiometric()}
                  className="flex items-center gap-2 text-[15px] font-normal text-[#0A84FF] transition-opacity hover:opacity-80 active:opacity-60 disabled:opacity-40"
                >
                  <BiometricIcon className="h-5 w-5 shrink-0" />
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
                    setShowBioSetup(false);
                    setUnlocked(false);
                    setBioError(null);
                    bioAutoAttempted.current = false;
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
