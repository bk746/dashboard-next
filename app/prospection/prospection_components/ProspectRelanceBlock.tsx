"use client";

import { Bell, Mail, Phone } from "lucide-react";
import type { Prospect, ProspectRelanceCanal } from "@/app/types";
import {
  aEuPremierAppel,
  besoinRelance,
  dateEffectiveProchaineRelance,
  formatDateISOFr,
  patchRelanceSansReponse,
  RELANCE_DELAI_JOURS_OUVRES,
} from "@/app/prospection/prospection_utils";

const lightLabelClass = "block text-sm text-zinc-600 mb-2";
const lightPanelSurface = "rounded-2xl border-0 bg-[#6C5DD3]/[0.06] p-4 sm:p-5 space-y-4";

interface ProspectRelanceBlockProps {
  form: Prospect;
  onChange: (patch: Partial<Prospect>) => void;
}

const CANAL_BTN: { canal: ProspectRelanceCanal; label: string; Icon: typeof Phone }[] = [
  { canal: "appel", label: "Appel sans réponse", Icon: Phone },
  { canal: "mail", label: "Mail sans réponse", Icon: Mail },
];

export default function ProspectRelanceBlock({ form, onChange }: ProspectRelanceBlockProps) {
  const prochaine = dateEffectiveProchaineRelance(form);
  const aRelancer = besoinRelance(form);
  const historique = [...(form.relancesSansReponse ?? [])].reverse();

  const marquerSansReponse = (canal: ProspectRelanceCanal) => {
    onChange(patchRelanceSansReponse(form, canal));
  };

  if (!aEuPremierAppel(form)) {
    return (
      <div className="md:col-span-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3">
        <p className="text-sm text-zinc-600">
          Les relances démarrent après le <strong>premier appel passé</strong> (statut du contact + date). Le bouton{" "}
          <strong>Audit fait</strong> sert uniquement à votre suivi, sans lancer de relance.
        </p>
      </div>
    );
  }

  return (
    <div className="md:col-span-2 space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 shrink-0 text-[#6C5DD3]" aria-hidden />
        <h3 className="text-sm font-semibold text-zinc-900">Relances</h3>
      </div>

      <div className={lightPanelSurface}>
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            aRelancer
              ? "border-amber-300/90 bg-amber-50/80 text-amber-950"
              : "border-zinc-200/90 bg-white text-zinc-700"
          }`}
        >
          {aRelancer ? (
            <p>
              <strong>Relance à faire</strong>
              {prochaine ? (
                <>
                  {" "}
                  — échéance le <strong>{formatDateISOFr(prochaine)}</strong>
                </>
              ) : null}
            </p>
          ) : prochaine ? (
            <p>
              Prochaine relance prévue le <strong>{formatDateISOFr(prochaine)}</strong> (jours ouvrés uniquement).
            </p>
          ) : (
            <p>Aucune relance planifiée pour l&apos;instant.</p>
          )}
        </div>

        <div>
          <p className={lightLabelClass}>Pas de réponse ?</p>
          <p className="mb-3 text-xs text-zinc-500">
            Chaque tentative sans réponse repousse la prochaine relance de{" "}
            <strong>{RELANCE_DELAI_JOURS_OUVRES} jours ouvrés</strong> (samedi et dimanche non comptés).
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {CANAL_BTN.map(({ canal, label, Icon }) => (
              <button
                key={canal}
                type="button"
                onClick={() => marquerSansReponse(canal)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-[#6C5DD3]/30 hover:bg-[#6C5DD3]/[0.04]"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#6C5DD3]" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        {historique.length > 0 ? (
          <div className="border-t border-zinc-200/80 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Historique sans réponse
            </p>
            <ul className="space-y-1.5 text-sm text-zinc-700">
              {historique.map((r, i) => (
                <li key={`${r.date}-${r.canal}-${i}`} className="flex items-center gap-2">
                  <span className="tabular-nums text-zinc-500">{formatDateISOFr(r.date)}</span>
                  <span className="text-zinc-400">·</span>
                  <span>{r.canal === "appel" ? "Appel" : "Mail"} sans réponse</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
