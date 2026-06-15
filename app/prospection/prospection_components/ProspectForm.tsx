"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { Calendar, Clock } from "lucide-react";
import type {
  AuditVisuelRecord,
  Prospect,
  ProspectEtapeContact,
  ProspectRdv,
  ProspectReponseClient,
} from "@/app/types";
import ProspectRelanceBlock from "@/app/prospection/prospection_components/ProspectRelanceBlock";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import {
  dateEtapeEnCours,
  emptyProspect,
  ETAPES_CONTACT,
  estReponseClosee,
  getDateAppel,
  migrateProspect,
  numeroAppelEtape,
  patchDateAppel,
  patchDatesForEtapeContact,
  prospectSiteHref,
  removeProspectAuditBucket,
  REPONSES_CLIENT,
  todayDateISO,
} from "@/app/prospection/prospection_utils";
import { overlayBackdropClass, overlayScrollBodyClass, overlayPanelWideClass, overlayFooterClass, secondaryButtonClass } from "@/app/components/appCardStyles";
import ModalPortal from "@/components/ModalPortal";

const lightPanelSurface = "rounded-2xl border-0 bg-[#007AFF]/[0.06] p-4 sm:p-5 space-y-4";

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
  const [, setAuditsVisuels] = useJsonBucket<AuditVisuelRecord[]>("audits-visuels", []);

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
    const nAppel = numeroAppelEtape(et);
    if (nAppel > 0 && !getDateAppel(form, nAppel as 1 | 2 | 3 | 4)) return;
    const now = new Date().toISOString();
    const {
      statut: _legacy,
      dateMailEnvoye: _dm,
      dateAppelPasse: _da,
      dateAuditPersoEnvoye: _dap,
      ...sansStatut
    } = form as Prospect & { statut?: string };
    const siteTrim = sansStatut.siteWeb?.trim();
    const prospectIdSave = prospect?.id ?? form.id;
    setAuditsVisuels((list) => removeProspectAuditBucket(list, prospectIdSave));
    const reponseFinale = (sansStatut.reponseClient ?? "en_attente") as ProspectReponseClient;
    const payload: Prospect = {
      ...sansStatut,
      siteWeb: siteTrim || undefined,
      urgent: !!sansStatut.urgent,
      rdv: rdvActif ? sansStatut.rdv : [],
      auditVisuel: undefined,
      reponseClient: reponseFinale,
      etapeContact: sansStatut.etapeContact as ProspectEtapeContact,
      id: prospectIdSave,
      updatedAt: now,
      createdAt: prospect?.createdAt ?? form.createdAt,
    };
    if (estReponseClosee(payload) || payload.etapeContact === "aucun") {
      payload.dateProchaineRelance = undefined;
    }
    onSave(payload);
    onClose();
  };

  const title = prospect ? "Modifier le prospect" : "Nouveau prospect";

  const lightInputClass =
    "w-full rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-[#007AFF] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/15 transition-colors md:px-4 md:py-2 md:text-base";
  const lightLabelClass = "block text-xs text-zinc-600 mb-1.5 md:text-sm md:mb-2";
  const violetPrimaryBtn =
    "px-4 py-2 rounded-full font-semibold text-sm text-white bg-[#007AFF] transition-colors hover:bg-[#0066D6] md:px-5 md:py-2.5";

  const rdvTri = [...form.rdv].sort(
    (a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime()
  );

  const libelleEtapeCourante =
    ETAPES_CONTACT.find((s) => s.value === form.etapeContact)?.label ?? "cette étape";

  const siteHrefPreview = prospectSiteHref(form.siteWeb);
  const siteWebSaisi = (form.siteWeb ?? "").trim();
  const auditFait = !!form.dateAuditFait?.trim();
  const auditEnvoye = !!form.dateAuditEnvoye?.trim();

  const setAuditFait = (on: boolean) => {
    setForm((f) => ({
      ...f,
      dateAuditFait: on ? f.dateAuditFait?.trim() || todayDateISO() : undefined,
    }));
  };

  const setAuditEnvoye = (on: boolean) => {
    setForm((f) => ({
      ...f,
      dateAuditEnvoye: on ? f.dateAuditEnvoye?.trim() || todayDateISO() : undefined,
    }));
  };

  const setDateEtape = (iso: string | undefined) => {
    const v = iso?.trim() || undefined;
    setForm((f) => {
      const n = numeroAppelEtape(f.etapeContact);
      if (n === 0) return f;
      return { ...f, ...patchDateAppel(f, n, v) };
    });
  };

  return (
    <ModalPortal>
    <div className={overlayBackdropClass} onClick={onClose} role="presentation">
      <div
        className={overlayPanelWideClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prospect-form-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-4 py-3 sm:px-5 sm:py-4">
          <h2 id="prospect-form-title" className="text-base font-semibold tracking-tight text-zinc-900 pr-2 md:text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Fermer"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={`${overlayScrollBodyClass} overlay-form-compact`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="md:col-span-2">
                <label className={lightLabelClass}>Entreprise *</label>
                <input
                  type="text"
                  required
                  value={form.entreprise}
                  onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
                  className={lightInputClass}
                />
              </div>
              <div>
                <label className={lightLabelClass}>Contact</label>
                <input
                  type="text"
                  value={form.contactNom ?? ""}
                  onChange={(e) => setForm({ ...form, contactNom: e.target.value })}
                  className={lightInputClass}
                />
              </div>
              <div>
                <label className={lightLabelClass}>Téléphone</label>
                <input
                  type="text"
                  value={form.telephone ?? ""}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className={lightInputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={lightLabelClass}>Email</label>
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={lightInputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={lightLabelClass}>Site web</label>
                <input
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="ex. monsite.fr ou https://…"
                  value={form.siteWeb ?? ""}
                  onChange={(e) => setForm({ ...form, siteWeb: e.target.value })}
                  className={lightInputClass}
                />
                {siteHrefPreview ? (
                  <p className="mt-2 text-sm">
                    <a
                      href={siteHrefPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-medium text-[#007AFF] underline underline-offset-2 hover:text-[#0066D6]"
                    >
                      {siteHrefPreview}
                    </a>
                  </p>
                ) : siteWebSaisi ? (
                  <p className="mt-2 text-xs text-zinc-500">Adresse web non reconnue — vérifiez le format.</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-0 bg-[#007AFF]/[0.06] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.urgent ?? false}
                    onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-[#007AFF] focus:ring-[#007AFF]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-zinc-900">Urgent — site critique</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      À traiter en priorité (repère rouge à côté du nom dans la liste).
                    </span>
                  </span>
                </label>
              </div>

              <div className="md:col-span-2 space-y-3">
                <p className={lightLabelClass}>Audit</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={auditFait}
                      onClick={() => setAuditFait(!auditFait)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        auditFait
                          ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-900"
                          : "border-zinc-200/90 bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {auditFait ? "✓ Audit fait" : "Audit fait"}
                    </button>
                    {auditFait ? (
                      <input
                        id="date-audit-fait"
                        type="date"
                        aria-label="Date audit fait"
                        value={form.dateAuditFait ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, dateAuditFait: e.target.value || undefined }))
                        }
                        className={`${lightInputClass} max-w-[150px] py-1.5 text-sm`}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={auditEnvoye}
                      onClick={() => setAuditEnvoye(!auditEnvoye)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        auditEnvoye
                          ? "border-sky-500/45 bg-sky-500/15 text-sky-950"
                          : "border-zinc-200/90 bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {auditEnvoye ? "✓ Audit envoyé" : "Audit envoyé"}
                    </button>
                    {auditEnvoye ? (
                      <input
                        id="date-audit-envoye"
                        type="date"
                        aria-label="Date audit envoyé"
                        value={form.dateAuditEnvoye ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, dateAuditEnvoye: e.target.value || undefined }))
                        }
                        className={`${lightInputClass} max-w-[150px] py-1.5 text-sm`}
                      />
                    ) : null}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  <strong>Audit fait</strong> : retire le prospect de « Audit à faire ». <strong>Audit envoyé</strong> :
                  date d&apos;envoi au client. Les relances restent liées au 1er appel.
                </p>
              </div>

              <div>
                <label className={lightLabelClass}>Statut du contact</label>
                <select
                  value={form.etapeContact}
                  onChange={(e) => {
                    const v = e.target.value as ProspectEtapeContact;
                    setForm((f) => ({ ...f, ...patchDatesForEtapeContact(f, v) }));
                  }}
                  className={lightInputClass}
                >
                  {ETAPES_CONTACT.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.emoji} {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lightLabelClass}>Réponse du prospect</label>
                <select
                  value={form.reponseClient ?? "en_attente"}
                  onChange={(e) =>
                    setForm({ ...form, reponseClient: e.target.value as ProspectReponseClient })
                  }
                  className={lightInputClass}
                >
                  {REPONSES_CLIENT.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.emoji} {s.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500">
                  Par défaut : <strong>En attente</strong>. Choisissez Validé ou Refusé lorsque la réponse est connue.
                </p>
              </div>

              {numeroAppelEtape(form.etapeContact) > 0 ? (
                <div className="md:col-span-2">
                  <label className={lightLabelClass}>Date de l&apos;appel *</label>
                  <input
                    type="date"
                    required
                    value={dateEtapeEnCours(form) ?? ""}
                    onChange={(e) => setDateEtape(e.target.value || undefined)}
                    className={`${lightInputClass} max-w-[220px]`}
                  />
                  <p className="text-xs text-zinc-500">
                    Date pour <strong>{libelleEtapeCourante}</strong> (proposée à aujourd&apos;hui si vide).
                  </p>
                </div>
              ) : null}

              <ProspectRelanceBlock
                form={form}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
              />
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar
                      className="h-5 w-5 shrink-0 text-[#007AFF]"
                      aria-hidden
                    />
                    <h3 className="text-sm font-semibold text-zinc-800">Rendez-vous</h3>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Activez le curseur pour planifier un ou plusieurs RDV. Sinon, aucun rendez-vous n&apos;est enregistré sur
                    cette fiche.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 self-end sm:self-center pl-7 sm:pl-0">
                  <span
                    id="rdv-switch-label"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Planifier un RDV
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rdvActif}
                    aria-labelledby="rdv-switch-label"
                    onClick={() => setRdvActif((a) => !a)}
                    className={`relative h-8 w-[3.35rem] shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] focus-visible:ring-offset-2 ${
                      rdvActif ? "bg-[#007AFF]" : "bg-zinc-300/90"
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
                <p className="text-xs text-zinc-500">
                  Date et heure séparées — sur téléphone, les sélecteurs permettent de faire défiler comme des molettes.
                </p>
              )}

              {rdvActif ? (
              <div className={lightPanelSurface}>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    Quand ?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="rdv-date"
                        className="mb-2 flex items-center gap-2 text-sm text-zinc-600"
                      >
                        <Calendar className="h-4 w-4 opacity-70" aria-hidden />
                        Date
                      </label>
                      <input
                        id="rdv-date"
                        type="date"
                        value={rdvDate}
                        onChange={(e) => setRdvDate(e.target.value)}
                        className={`${lightInputClass} min-h-[3rem] text-base`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="rdv-time"
                        className="mb-2 flex items-center gap-2 text-sm text-zinc-600"
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
                        className={`${lightInputClass} min-h-[3rem] text-base`}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyRdvPreset("h1")}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      Dans 1 h
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRdvPreset("h2")}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      Dans 2 h
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRdvPreset("tomorrow9")}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      Demain 9 h
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRdvPreset("tomorrow14")}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      Demain 14 h
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-zinc-200/80 pt-4">
                  <div className="sm:col-span-2">
                    <label className={lightLabelClass}>Titre (optionnel)</label>
                    <input
                      type="text"
                      value={rdvTitre}
                      onChange={(e) => setRdvTitre(e.target.value)}
                      placeholder="Ex. Appel découverte, visio…"
                      className={lightInputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lightLabelClass}>Note</label>
                    <input
                      type="text"
                      value={rdvNote}
                      onChange={(e) => setRdvNote(e.target.value)}
                      placeholder="Lien visio, ordre du jour…"
                      className={lightInputClass}
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
                <div className="rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/50 px-4 py-6 text-center">
                  <p className="text-sm text-zinc-600">
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
                      className="rounded-lg border border-zinc-200/80"
                    >
                      <div>
                        <span className="font-medium text-zinc-800">
                          {new Date(r.debut).toLocaleString("fr-FR")}
                        </span>
                        {r.titre && <span className="text-zinc-600"> — {r.titre}</span>}
                        {r.note && <p className="text-zinc-600">{r.note}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => supprimerRdv(r.id)}
                        className="text-xs text-rose-600"
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
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} py-2 text-sm md:py-2.5 md:text-base`}>
              Annuler
            </button>
            <button type="submit" className={violetPrimaryBtn}>
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
