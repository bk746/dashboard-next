"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { Calendar, Clock } from "lucide-react";
import type { Prospect, ProspectEtapeContact, ProspectRdv, ProspectReponseClient } from "@/app/types";
import {
  dateEtapeEnCours,
  emptyProspect,
  ETAPES_CONTACT,
  migrateProspect,
  patchDatesForEtapeContact,
  prospectSiteHref,
  REPONSES_CLIENT,
} from "@/app/prospection/prospection_utils";
import {
  overlayBackdropClass,
  overlayPanelWideClass,
  overlayHeaderClass,
  overlayTitleClass,
  overlayCloseButtonClass,
  overlayScrollBodyClass,
  overlayFooterClass,
  inputFieldClass,
  formLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
  panelSurfaceClass,
} from "@/app/components/appCardStyles";

interface ProspectFormProps {
  prospect?: Prospect | null;
  onClose: () => void;
  onSave: (p: Prospect) => void;
}

/** Prochain créneau suggéré (≈ +1 h, arrondi à la quart d’heure). */
function suggestedRdvSlot(): { date: string; time: string } {
  const t = new Date();
  t.setMinutes(t.getMinutes() + 60);
  t.setSeconds(0, 0);
  t.setMinutes(Math.ceil(t.getMinutes() / 15) * 15);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return {
    date: `${y}-${m}-${d}`,
    time: `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`,
  };
}

function localDateTimeToISO(dateStr: string, timeStr: string): string | null {
  if (!dateStr?.trim()) return null;
  const time = timeStr?.trim() || "09:00";
  const [hh, mm = "0"] = time.split(":");
  const y = parseInt(dateStr.slice(0, 4), 10);
  const mo = parseInt(dateStr.slice(5, 7), 10);
  const day = parseInt(dateStr.slice(8, 10), 10);
  const h = parseInt(hh, 10);
  const min = parseInt(mm, 10);
  if ([y, mo, day, h, min].some((n) => Number.isNaN(n))) return null;
  const dt = new Date(y, mo - 1, day, h, min, 0, 0);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

export default function ProspectForm({ prospect, onClose, onSave }: ProspectFormProps) {
  const [form, setForm] = useState<Prospect>(() =>
    prospect ? migrateProspect(prospect) : emptyProspect()
  );
  /** Si false : pas de RDV à l’enregistrement (tableau vide) et pas de formulaire d’ajout. */
  const [rdvActif, setRdvActif] = useState(
    () => (prospect ? migrateProspect(prospect).rdv.length > 0 : false)
  );
  const [rdvDate, setRdvDate] = useState(() => suggestedRdvSlot().date);
  const [rdvTime, setRdvTime] = useState(() => suggestedRdvSlot().time);
  const [rdvTitre, setRdvTitre] = useState("");
  const [rdvNote, setRdvNote] = useState("");

  useEffect(() => {
    const next = prospect ? migrateProspect(prospect) : emptyProspect();
    setForm(next);
    setRdvActif(next.rdv.length > 0);
    const slot = suggestedRdvSlot();
    setRdvDate(slot.date);
    setRdvTime(slot.time);
    setRdvTitre("");
    setRdvNote("");
  }, [prospect]);

  const ajouterRdv = () => {
    if (!rdvActif) return;
    const debut = localDateTimeToISO(rdvDate, rdvTime);
    if (!debut) return;
    const r: ProspectRdv = {
      id: `${Date.now()}-r`,
      debut,
      titre: rdvTitre.trim() || undefined,
      note: rdvNote.trim() || undefined,
    };
    setForm((f) => ({
      ...f,
      rdv: [...f.rdv, r].sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime()),
      updatedAt: new Date().toISOString(),
    }));
    const next = suggestedRdvSlot();
    setRdvDate(next.date);
    setRdvTime(next.time);
    setRdvTitre("");
    setRdvNote("");
  };

  const applyRdvPreset = (kind: "h1" | "h2" | "tomorrow9" | "tomorrow14") => {
    const base = new Date();
    if (kind === "h1") {
      base.setMinutes(base.getMinutes() + 60);
    } else if (kind === "h2") {
      base.setMinutes(base.getMinutes() + 120);
    } else if (kind === "tomorrow9") {
      base.setDate(base.getDate() + 1);
      base.setHours(9, 0, 0, 0);
    } else {
      base.setDate(base.getDate() + 1);
      base.setHours(14, 0, 0, 0);
    }
    if (kind === "h1" || kind === "h2") {
      base.setSeconds(0, 0);
      base.setMinutes(Math.ceil(base.getMinutes() / 15) * 15);
    }
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, "0");
    const d = String(base.getDate()).padStart(2, "0");
    setRdvDate(`${y}-${m}-${d}`);
    setRdvTime(`${String(base.getHours()).padStart(2, "0")}:${String(base.getMinutes()).padStart(2, "0")}`);
  };

  const supprimerRdv = (id: string) => {
    setForm((f) => ({ ...f, rdv: f.rdv.filter((x) => x.id !== id), updatedAt: new Date().toISOString() }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.entreprise.trim()) return;
    const et = form.etapeContact;
    if (et !== "aucun") {
      if (!form.dateAuditPersoEnvoye?.trim()) return;
      if ((et === "mail_envoye" || et === "appel_passe") && !form.dateMailEnvoye?.trim()) return;
      if (et === "appel_passe" && !form.dateAppelPasse?.trim()) return;
    }
    const now = new Date().toISOString();
    const { statut: _legacy, ...sansStatut } = form as Prospect & { statut?: string };
    const sansDatesSiAucun =
      et === "aucun"
        ? {
            ...sansStatut,
            dateAuditPersoEnvoye: undefined,
            dateMailEnvoye: undefined,
            dateAppelPasse: undefined,
          }
        : sansStatut;
    const siteTrim = sansStatut.siteWeb?.trim();
    onSave({
      ...sansDatesSiAucun,
      siteWeb: siteTrim || undefined,
      urgent: !!sansStatut.urgent,
      rdv: rdvActif ? sansStatut.rdv : [],
      reponseClient: (sansStatut.reponseClient ?? "en_attente") as ProspectReponseClient,
      etapeContact: sansStatut.etapeContact as ProspectEtapeContact,
      id: prospect?.id ?? form.id,
      updatedAt: now,
      createdAt: prospect?.createdAt ?? form.createdAt,
    });
    onClose();
  };

  const title = prospect ? "Modifier le prospect" : "Nouveau prospect";

  const rdvTri = [...form.rdv].sort(
    (a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime()
  );

  const libelleEtapeCourante =
    ETAPES_CONTACT.find((s) => s.value === form.etapeContact)?.label ?? "cette étape";

  const siteHrefPreview = prospectSiteHref(form.siteWeb);
  const siteWebSaisi = (form.siteWeb ?? "").trim();

  const setDateEtape = (iso: string | undefined) => {
    const v = iso?.trim() || undefined;
    setForm((f) => {
      switch (f.etapeContact) {
        case "aucun":
          return f;
        case "audit_envoye":
          return { ...f, dateAuditPersoEnvoye: v };
        case "mail_envoye":
          return { ...f, dateMailEnvoye: v };
        case "appel_passe":
          return { ...f, dateAppelPasse: v };
      }
    });
  };

  return (
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={overlayPanelWideClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prospect-form-title"
      >
        <div className={overlayHeaderClass}>
          <h2 id="prospect-form-title" className={overlayTitleClass}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className={overlayCloseButtonClass} aria-label="Fermer">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={overlayScrollBodyClass}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={formLabelClass}>Entreprise *</label>
                <input
                  type="text"
                  required
                  value={form.entreprise}
                  onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
                  className={inputFieldClass}
                />
              </div>
              <div>
                <label className={formLabelClass}>Contact</label>
                <input
                  type="text"
                  value={form.contactNom ?? ""}
                  onChange={(e) => setForm({ ...form, contactNom: e.target.value })}
                  className={inputFieldClass}
                />
              </div>
              <div>
                <label className={formLabelClass}>Téléphone</label>
                <input
                  type="text"
                  value={form.telephone ?? ""}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className={inputFieldClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={formLabelClass}>Email</label>
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputFieldClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={formLabelClass}>Site web</label>
                <input
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="ex. monsite.fr ou https://…"
                  value={form.siteWeb ?? ""}
                  onChange={(e) => setForm({ ...form, siteWeb: e.target.value })}
                  className={inputFieldClass}
                />
                {siteHrefPreview ? (
                  <p className="mt-2 text-sm">
                    <a
                      href={siteHrefPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-medium text-[#c26500] underline underline-offset-2 hover:text-[#a55500] dark:text-[#a8c0e0] dark:hover:text-[#c5d4ec]"
                    >
                      {siteHrefPreview}
                    </a>
                  </p>
                ) : siteWebSaisi ? (
                  <p className="mt-2 text-xs text-zinc-500">Adresse web non reconnue — vérifiez le format.</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50/50 px-4 py-3 dark:border-white/[0.1] dark:bg-white/[0.03]">
                  <input
                    type="checkbox"
                    checked={form.urgent ?? false}
                    onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-[#2563eb] focus:ring-[#2563eb] dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <span>
                    <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">Urgent — site critique</span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      À traiter en priorité (repère rouge à côté du nom dans la liste).
                    </span>
                  </span>
                </label>
              </div>

              <div>
                <label className={formLabelClass}>Étape (contact)</label>
                <select
                  value={form.etapeContact}
                  onChange={(e) => {
                    const v = e.target.value as ProspectEtapeContact;
                    setForm((f) => ({ ...f, ...patchDatesForEtapeContact(f, v) }));
                  }}
                  className={inputFieldClass}
                >
                  {ETAPES_CONTACT.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.emoji} {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={formLabelClass}>Réponse du prospect</label>
                <select
                  value={form.reponseClient ?? "en_attente"}
                  onChange={(e) =>
                    setForm({ ...form, reponseClient: e.target.value as ProspectReponseClient })
                  }
                  className={inputFieldClass}
                >
                  {REPONSES_CLIENT.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.emoji} {s.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  Par défaut : <strong>En attente</strong>. Choisissez Validé ou Refusé lorsque la réponse est connue.
                </p>
              </div>

              {form.etapeContact === "aucun" ? (
                <div className="md:col-span-2 rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/50 px-4 py-3 dark:border-white/[0.1] dark:bg-white/[0.03]">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Étape <strong>Aucun</strong> : pas de date d&apos;étape à renseigner. Choisissez une autre étape dès que
                    le contact avance.
                  </p>
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className={formLabelClass}>Date *</label>
                  <input
                    type="date"
                    required
                    value={dateEtapeEnCours(form) ?? ""}
                    onChange={(e) => setDateEtape(e.target.value || undefined)}
                    className={`${inputFieldClass} max-w-[220px]`}
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    Date de l&apos;action <strong>{libelleEtapeCourante}</strong>. Au changement d&apos;étape, une date est
                    proposée (aujourd&apos;hui) si besoin — vous pouvez la corriger.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar
                      className="h-5 w-5 shrink-0 text-[#ED8600] dark:text-[#8fa9c9]"
                      aria-hidden
                    />
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Rendez-vous</h3>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed pl-7 sm:pl-7">
                    Activez le curseur pour planifier un ou plusieurs RDV. Sinon, aucun rendez-vous n&apos;est enregistré sur
                    cette fiche.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 self-end sm:self-center pl-7 sm:pl-0">
                  <span
                    id="rdv-switch-label"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
                  >
                    Planifier un RDV
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rdvActif}
                    aria-labelledby="rdv-switch-label"
                    onClick={() => setRdvActif((a) => !a)}
                    className={`relative h-8 w-[3.35rem] shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED8600] focus-visible:ring-offset-2 dark:focus-visible:ring-[#8fa9c9] dark:focus-visible:ring-offset-[#0a0a0c] ${
                      rdvActif
                        ? "bg-[#ED8600] dark:bg-[#5b7fb8]"
                        : "bg-zinc-300/90 dark:bg-zinc-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ease-out ${
                        rdvActif ? "translate-x-[1.4rem]" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {rdvActif && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 pl-7 -mt-1 sm:pl-0">
                  Date et heure séparées — sur téléphone, les sélecteurs permettent de faire défiler comme des molettes.
                </p>
              )}

              {rdvActif ? (
              <div className={`${panelSurfaceClass} p-4 sm:p-5 space-y-4`}>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
                    Quand ?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="rdv-date"
                        className="mb-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                      >
                        <Calendar className="h-4 w-4 opacity-70" aria-hidden />
                        Date
                      </label>
                      <input
                        id="rdv-date"
                        type="date"
                        value={rdvDate}
                        onChange={(e) => setRdvDate(e.target.value)}
                        className={`${inputFieldClass} min-h-[3rem] text-base [color-scheme:light] dark:[color-scheme:dark]`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="rdv-time"
                        className="mb-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                      >
                        <Clock className="h-4 w-4 opacity-70" aria-hidden />
                        Heure
                      </label>
                      <input
                        id="rdv-time"
                        type="time"
                        step={300}
                        value={rdvTime}
                        onChange={(e) => setRdvTime(e.target.value)}
                        className={`${inputFieldClass} min-h-[3rem] text-base [color-scheme:light] dark:[color-scheme:dark]`}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyRdvPreset("h1")}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.08]"
                    >
                      Dans 1 h
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRdvPreset("h2")}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.08]"
                    >
                      Dans 2 h
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRdvPreset("tomorrow9")}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.08]"
                    >
                      Demain 9 h
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRdvPreset("tomorrow14")}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.08]"
                    >
                      Demain 14 h
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-zinc-200/80 pt-4 dark:border-white/[0.08]">
                  <div className="sm:col-span-2">
                    <label className={formLabelClass}>Titre (optionnel)</label>
                    <input
                      type="text"
                      value={rdvTitre}
                      onChange={(e) => setRdvTitre(e.target.value)}
                      placeholder="Ex. Appel découverte, visio…"
                      className={inputFieldClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={formLabelClass}>Note</label>
                    <input
                      type="text"
                      value={rdvNote}
                      onChange={(e) => setRdvNote(e.target.value)}
                      placeholder="Lien visio, ordre du jour…"
                      className={inputFieldClass}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={ajouterRdv}
                  disabled={!rdvDate.trim()}
                  className={`${secondaryButtonClass} w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none`}
                >
                  Ajouter le RDV
                </button>
              </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/50 px-4 py-6 text-center dark:border-white/[0.1] dark:bg-white/[0.02]">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Option désactivée — aucun rendez-vous ne sera enregistré pour ce prospect.
                  </p>
                </div>
              )}

              {rdvActif && (
              <ul className="space-y-2">
                {rdvTri.length === 0 ? (
                  <li className="text-sm text-zinc-500">Aucun RDV ajouté pour l&apos;instant.</li>
                ) : (
                  rdvTri.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-lg border border-zinc-200/80 dark:border-white/[0.08] px-3 py-2 text-sm flex justify-between gap-2"
                    >
                      <div>
                        <span className="font-medium text-zinc-800 dark:text-zinc-100">
                          {new Date(r.debut).toLocaleString("fr-FR")}
                        </span>
                        {r.titre && <span className="text-zinc-600 dark:text-zinc-400"> — {r.titre}</span>}
                        {r.note && <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{r.note}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => supprimerRdv(r.id)}
                        className="text-xs text-rose-600 dark:text-rose-400 shrink-0"
                      >
                        Supprimer
                      </button>
                    </li>
                  ))
                )}
              </ul>
              )}
            </div>
          </div>

          <div className={overlayFooterClass}>
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              Annuler
            </button>
            <button type="submit" className={primaryButtonClass}>
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
