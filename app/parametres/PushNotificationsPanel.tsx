"use client";

import { useState } from "react";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  parametresFloatingCard,
  parametresPrimaryBtn,
  parametresSecondaryBtn,
  parametresSectionTitle,
} from "./parametresUi";

function StatusBadge({ status }: { status: ReturnType<typeof usePushNotifications>["status"] }) {
  const map: Record<string, { label: string; className: string }> = {
    subscribed: { label: "Activées", className: "bg-emerald-500/12 text-emerald-700" },
    idle: { label: "Désactivées", className: "bg-zinc-100 text-zinc-600" },
    denied: { label: "Refusées", className: "bg-rose-500/12 text-rose-700" },
    ios_needs_install: { label: "Installer l'app", className: "bg-amber-500/12 text-amber-800" },
    no_cloud: { label: "Cloud requis", className: "bg-amber-500/12 text-amber-800" },
    unsupported: { label: "Non supporté", className: "bg-zinc-100 text-zinc-500" },
    loading: { label: "…", className: "bg-zinc-100 text-zinc-500" },
    error: { label: "Erreur", className: "bg-rose-500/12 text-rose-700" },
  };
  const item = map[status] ?? map.idle;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}>
      {item.label}
    </span>
  );
}

export default function PushNotificationsPanel() {
  const { status, error, subscribe, unsubscribe, sendTest, cloud, user } = usePushNotifications();
  const [testOk, setTestOk] = useState(false);
  const [testBusy, setTestBusy] = useState(false);

  const handleTest = async () => {
    setTestBusy(true);
    setTestOk(false);
    try {
      await sendTest();
      setTestOk(true);
      setTimeout(() => setTestOk(false), 4000);
    } finally {
      setTestBusy(false);
    }
  };

  return (
    <div className={parametresFloatingCard}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={parametresSectionTitle}>Notifications iPhone</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Alertes factures en retard et relances prospection, même app fermée.
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl bg-[#007AFF]/[0.06] p-4">
          <div className="flex gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#007AFF]" aria-hidden />
            <div className="text-sm text-zinc-700">
              <p className="font-medium text-zinc-900">Sur iPhone (obligatoire)</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-zinc-600">
                <li>Ouvrir BK Copilot dans Safari</li>
                <li>Partager → <strong>Sur l&apos;écran d&apos;accueil</strong></li>
                <li>Lancer l&apos;app depuis l&apos;icône, puis activer ci-dessous</li>
              </ol>
            </div>
          </div>
        </div>

        {status === "no_cloud" ? (
          <p className="text-sm text-amber-800">
            Connectez-vous avec votre compte (sync cloud) pour recevoir les notifications sur tous vos
            appareils.
            {!cloud ? " Supabase n'est pas configuré sur ce déploiement." : !user ? " Vous n'êtes pas connecté." : null}
          </p>
        ) : null}

        {status === "ios_needs_install" ? (
          <p className="text-sm text-amber-800">
            Ajoutez l&apos;app à l&apos;écran d&apos;accueil avant d&apos;activer les notifications (exigence
            Apple).
          </p>
        ) : null}

        {status === "denied" ? (
          <p className="text-sm text-rose-700">
            Notifications bloquées. Réglages iPhone → Notifications → BK Copilot → Autoriser.
          </p>
        ) : null}

        {error ? (
          <p className="text-sm font-medium text-rose-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {status !== "subscribed" && status !== "unsupported" && status !== "no_cloud" ? (
            <button
              type="button"
              onClick={() => void subscribe()}
              disabled={status === "loading" || status === "ios_needs_install"}
              className={`${parametresPrimaryBtn} inline-flex items-center gap-2`}
            >
              <Bell className="h-4 w-4" aria-hidden />
              Activer les notifications
            </button>
          ) : null}

          {status === "subscribed" ? (
            <>
              <button
                type="button"
                onClick={() => void unsubscribe()}
                className={`${parametresSecondaryBtn} inline-flex items-center gap-2`}
              >
                <BellOff className="h-4 w-4" aria-hidden />
                Désactiver
              </button>
              <button
                type="button"
                onClick={() => void handleTest()}
                disabled={testBusy}
                className={`${parametresSecondaryBtn} inline-flex items-center gap-2`}
              >
                {testBusy ? "Envoi…" : "Tester maintenant"}
              </button>
            </>
          ) : null}
        </div>

        {testOk ? (
          <p className="text-sm font-medium text-emerald-600">Notification test envoyée.</p>
        ) : null}

        <p className="text-xs text-zinc-400">
          Envoi automatique chaque matin (8 h) si des factures sont en retard ou des relances sont à
          faire.
        </p>
      </div>
    </div>
  );
}
