"use client";

import { useCallback, useEffect, useState } from "react";
import PinPadScreen from "@/components/PinPadScreen";
import { verifyPin } from "@/lib/pinLock";
import {
  authenticateWithBiometric,
  detectBiometricKind,
  getBiometricActionLabel,
  hasBiometricCredential,
  isPlatformAuthenticatorAvailable,
} from "@/lib/biometricUnlock";
import { Fingerprint, ScanFace, X } from "lucide-react";

const sf =
  "font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Segoe_UI',sans-serif]";

function BiometricIcon({ className }: { className?: string }) {
  const kind = detectBiometricKind();
  if (kind === "touchId") {
    return <Fingerprint className={className} strokeWidth={1.5} aria-hidden />;
  }
  return <ScanFace className={className} strokeWidth={1.5} aria-hidden />;
}

export interface SecureConfirmRequest {
  title: string;
  message: string;
  onConfirm: () => void;
}

interface SecureConfirmDialogProps {
  request: SecureConfirmRequest | null;
  onClose: () => void;
}

/** Confirmation sensible — même code (ou Face ID / Touch ID) que le déverrouillage de l’app. */
export default function SecureConfirmDialog({ request, onClose }: SecureConfirmDialogProps) {
  const open = request !== null;
  const [padKey, setPadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [platformBio, setPlatformBio] = useState(false);
  const [hasBioCred, setHasBioCred] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setPadKey((k) => k + 1);
    setHasBioCred(hasBiometricCredential());
    void isPlatformAuthenticatorAvailable().then(setPlatformBio);
  }, [open, request?.title, request?.message]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const finish = useCallback(() => {
    request?.onConfirm();
    onClose();
  }, [request, onClose]);

  const handlePin = useCallback(
    async (pin: string) => {
      const ok = await verifyPin(pin);
      if (!ok) {
        setError("Code incorrect. Réessayez.");
        setPadKey((k) => k + 1);
        return;
      }
      finish();
    },
    [finish]
  );

  const tryBiometric = useCallback(async () => {
    setBioBusy(true);
    setError(null);
    try {
      const ok = await authenticateWithBiometric();
      if (ok) {
        finish();
      } else {
        setError("Authentification annulée ou refusée.");
      }
    } finally {
      setBioBusy(false);
    }
  }, [finish]);

  if (!open || !request) return null;

  return (
    <div
      className={`${sf} fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center sm:pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-20`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="secure-confirm-title"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <h2 id="secure-confirm-title" className="text-lg font-semibold tracking-tight text-white">
              {request.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-white/55">{request.message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {error ? (
          <p className="px-5 pt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col items-center px-4 py-8">
          <PinPadScreen
            key={padKey}
            variant="embedded"
            title="Confirmer avec votre code"
            subtitle="Même code qu’à l’ouverture de l’app — 4 chiffres."
            onComplete={(pin) => void handlePin(pin)}
          />
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-white/10 px-5 py-4">
          {platformBio && hasBioCred ? (
            <button
              type="button"
              disabled={bioBusy}
              onClick={() => void tryBiometric()}
              className="flex items-center gap-2 text-[15px] font-medium text-[#0A84FF] transition-opacity hover:opacity-80 active:opacity-60 disabled:opacity-40"
            >
              <BiometricIcon className="h-5 w-5 shrink-0" />
              {bioBusy ? "Vérification…" : getBiometricActionLabel("unlock")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="py-1 text-[15px] font-normal text-white/45 transition-colors hover:text-white/70"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
