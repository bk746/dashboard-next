"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import PinPadScreen from "@/components/PinPadScreen";
import { isPinConfigured, savePin, verifyPin } from "@/lib/pinLock";
import {
  panelSurfaceClass,
  sectionHeadingClass,
  primaryButtonClass,
  sectionIntroDescClass,
} from "@/app/components/appCardStyles";

type Step = "current" | "new" | "confirm";

export default function ChangePinPanel() {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [inFlow, setInFlow] = useState(false);
  const [step, setStep] = useState<Step>("current");
  const [padKey, setPadKey] = useState(0);
  const newPinRef = useRef<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    setHasPin(isPinConfigured());
  }, []);

  const startFlow = useCallback(() => {
    setError(null);
    setShowSuccess(false);
    newPinRef.current = null;
    setStep(hasPin ? "current" : "new");
    setPadKey((k) => k + 1);
    setInFlow(true);
  }, [hasPin]);

  const cancelFlow = useCallback(() => {
    newPinRef.current = null;
    setError(null);
    setInFlow(false);
    setStep("current");
    setPadKey((k) => k + 1);
  }, []);

  const onCurrent = useCallback(async (pin: string) => {
    const ok = await verifyPin(pin);
    if (!ok) {
      setError("Code actuel incorrect.");
      setPadKey((k) => k + 1);
      return;
    }
    setError(null);
    newPinRef.current = null;
    setStep("new");
    setPadKey((k) => k + 1);
  }, []);

  const onNew = useCallback((pin: string) => {
    newPinRef.current = pin;
    setError(null);
    setStep("confirm");
    setPadKey((k) => k + 1);
  }, []);

  const onConfirm = useCallback(async (pin: string) => {
    if (newPinRef.current !== pin) {
      setError("Les deux nouveaux codes ne correspondent pas. Recommence.");
      newPinRef.current = null;
      setStep("new");
      setPadKey((k) => k + 1);
      return;
    }
    await savePin(pin);
    setHasPin(true);
    setError(null);
    newPinRef.current = null;
    setInFlow(false);
    setShowSuccess(true);
    setStep("current");
    setPadKey((k) => k + 1);
  }, []);

  if (hasPin === null) {
    return (
      <div className={`${panelSurfaceClass} p-8 text-center`}>
        <p className="text-sm text-zinc-500">Chargement…</p>
      </div>
    );
  }

  return (
    <div className={`${panelSurfaceClass} p-6 md:p-8`}>
      <h3 className={sectionHeadingClass}>Code d&apos;accès (4 chiffres)</h3>
      <p className={`${sectionIntroDescClass} mt-2 max-w-xl`}>
        Code affiché au lancement de l&apos;app sur cet appareil. Stocké localement (hashé), pas sur le serveur.
      </p>

      {showSuccess && (
        <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Nouveau code enregistré. Il s&apos;appliquera au prochain rechargement de la page.
          </p>
          <button type="button" className={`${primaryButtonClass} mt-3`} onClick={() => setShowSuccess(false)}>
            OK
          </button>
        </div>
      )}

      {!showSuccess && !inFlow && (
        <div className="mt-6">
          <button type="button" onClick={startFlow} className={primaryButtonClass}>
            {hasPin ? "Changer le code" : "Définir un code"}
          </button>
        </div>
      )}

      {!showSuccess && inFlow && (
        <>
          {error && (
            <p className="mt-4 text-sm text-red-500 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="mt-6 rounded-[2rem] border border-white/[0.06] bg-black px-4 py-10 sm:px-10">
            <div className="mx-auto mb-6 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">BK Copilot</p>
              <p className="mt-1 text-[11px] text-white/28">Code d&apos;accès</p>
            </div>
            <div className="flex justify-center">
              {hasPin && step === "current" && (
                <PinPadScreen
                  key={`current-${padKey}`}
                  variant="embedded"
                  title="Code actuel"
                  subtitle="Saisis ton code actuel pour continuer."
                  onComplete={(pin) => void onCurrent(pin)}
                />
              )}
              {step === "new" && (
                <PinPadScreen
                  key={`new-${padKey}`}
                  variant="embedded"
                  title={hasPin ? "Nouveau code" : "Créer un code"}
                  subtitle="Choisis quatre chiffres."
                  onComplete={onNew}
                />
              )}
              {step === "confirm" && (
                <PinPadScreen
                  key={`confirm-${padKey}`}
                  variant="embedded"
                  title="Confirmer le nouveau code"
                  subtitle="Saisis les quatre chiffres à nouveau."
                  onComplete={(pin) => void onConfirm(pin)}
                />
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={cancelFlow}
              className="text-[15px] font-normal text-[#0A84FF] transition-opacity hover:opacity-80"
            >
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}
