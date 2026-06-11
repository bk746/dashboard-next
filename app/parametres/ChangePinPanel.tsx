"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import PinPadScreen from "@/components/PinPadScreen";
import { isPinConfigured, savePin, verifyPin } from "@/lib/pinLock";
import {
  authenticateWithBiometric,
  clearBiometricCredential,
  getBiometricActionLabel,
  getBiometricHint,
  getBiometricTitle,
  hasBiometricCredential,
  isPlatformAuthenticatorAvailable,
  registerBiometricUnlock,
} from "@/lib/biometricUnlock";
import { Fingerprint, ScanFace } from "lucide-react";
import {
  parametresFloatingCard,
  parametresSectionTitle,
  parametresPrimaryBtn,
  parametresPinShell,
} from "./parametresUi";

type Step = "current" | "new" | "confirm";

function BiometricIcon({ className }: { className?: string }) {
  const isMac = typeof navigator !== "undefined" && /Macintosh|Mac OS X/i.test(navigator.userAgent);
  if (isMac) {
    return <Fingerprint className={className} strokeWidth={1.75} aria-hidden />;
  }
  return <ScanFace className={className} strokeWidth={1.75} aria-hidden />;
}

export default function ChangePinPanel() {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [inFlow, setInFlow] = useState(false);
  const [step, setStep] = useState<Step>("current");
  const [padKey, setPadKey] = useState(0);
  const newPinRef = useRef<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [platformBio, setPlatformBio] = useState(false);
  const [hasBioCred, setHasBioCred] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [bioMessage, setBioMessage] = useState<string | null>(null);

  useLayoutEffect(() => {
    setHasPin(isPinConfigured());
    setHasBioCred(hasBiometricCredential());
  }, []);

  useEffect(() => {
    void isPlatformAuthenticatorAvailable().then(setPlatformBio);
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

  const handleActivateBio = useCallback(async () => {
    if (!hasPin) {
      setBioMessage("Définis d’abord un code à 4 chiffres.");
      return;
    }
    setBioBusy(true);
    setBioMessage(null);
    try {
      const ok = await registerBiometricUnlock();
      if (ok) {
        setHasBioCred(true);
        setBioMessage(`${getBiometricActionLabel("activate")} — c’est prêt. Au prochain chargement, tu pourras t’en servir.`);
      } else {
        setBioMessage("Activation annulée ou impossible sur cet appareil.");
      }
    } finally {
      setBioBusy(false);
    }
  }, [hasPin]);

  const handleDisableBio = useCallback(() => {
    clearBiometricCredential();
    setHasBioCred(false);
    setBioMessage(`${getBiometricActionLabel("disable")} — utilise le code au prochain déverrouillage.`);
  }, []);

  const handleTestBio = useCallback(async () => {
    setBioBusy(true);
    setBioMessage(null);
    try {
      const ok = await authenticateWithBiometric();
      setBioMessage(ok ? "Test réussi — Touch ID / Face ID fonctionne." : "Test annulé ou refusé.");
    } finally {
      setBioBusy(false);
    }
  }, []);

  if (hasPin === null) {
    return (
      <div className={`${parametresFloatingCard} text-center`}>
        <p className="text-sm text-zinc-500">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={parametresFloatingCard}>
        <h3 className={parametresSectionTitle}>Code d&apos;accès (4 chiffres)</h3>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          Code affiché au lancement de l&apos;app sur cet appareil. Stocké localement (hashé), pas sur le serveur.
        </p>

        {showSuccess && (
          <div className="mt-4 rounded-2xl border border-emerald-200/90 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-800">
              Nouveau code enregistré. Il s&apos;appliquera au prochain rechargement de la page.
            </p>
            <button type="button" className={`${parametresPrimaryBtn} mt-3`} onClick={() => setShowSuccess(false)}>
              OK
            </button>
          </div>
        )}

        {!showSuccess && !inFlow && (
          <div className="mt-6">
            <button type="button" onClick={startFlow} className={parametresPrimaryBtn}>
              {hasPin ? "Changer le code" : "Définir un code"}
            </button>
          </div>
        )}

        {!showSuccess && inFlow && (
          <>
            {error ? (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <div className={parametresPinShell}>
              <div className="mx-auto mb-6 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/70">BK Copilot</p>
                <p className="mt-1 text-[11px] text-white/50">Code d&apos;accès</p>
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
                className="text-sm font-medium text-[#007AFF] transition-opacity hover:opacity-80"
              >
                Annuler
              </button>
            </div>
          </>
        )}
      </div>

      {platformBio ? (
        <div className={parametresFloatingCard}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#007AFF]/12 text-[#007AFF]">
              <BiometricIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={parametresSectionTitle}>{getBiometricTitle()}</h3>
              <p className="mt-2 text-sm text-zinc-500">{getBiometricHint()}</p>
              <p className="mt-2 text-xs text-zinc-400">
                {hasBioCred ? "Statut : activé sur cet appareil" : "Statut : non activé"}
                {!hasPin ? " — définis un code d’abord" : null}
              </p>
            </div>
          </div>

          {bioMessage ? (
            <p className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700">{bioMessage}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {!hasBioCred ? (
              <button
                type="button"
                disabled={bioBusy || !hasPin}
                onClick={() => void handleActivateBio()}
                className={parametresPrimaryBtn}
              >
                {bioBusy ? "En attente…" : getBiometricActionLabel("activate")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={bioBusy}
                  onClick={() => void handleTestBio()}
                  className={parametresPrimaryBtn}
                >
                  {bioBusy ? "Vérification…" : "Tester maintenant"}
                </button>
                <button
                  type="button"
                  disabled={bioBusy}
                  onClick={handleDisableBio}
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200/90 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  {getBiometricActionLabel("disable")}
                </button>
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-zinc-400">
            Fonctionne dans Safari ou Chrome sur Mac (Touch ID), iPhone/iPad (Face ID). En production, le site doit être
            en HTTPS.
          </p>
        </div>
      ) : (
        <div className={`${parametresFloatingCard} text-sm text-zinc-500`}>
          Touch ID / Face ID n&apos;est pas disponible sur ce navigateur ou cet appareil.
        </div>
      )}
    </div>
  );
}
