"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuditVisuelDossier, AuditVisuelRecord, Prospect } from "@/app/types";
import AuditVisuelBlock from "@/app/audit-visuel/AuditVisuelBlock";
import {
  deleteAuditRecord,
  prospectIdFromRecordId,
  upsertAuditRecord,
} from "@/app/audit-visuel/audit_visuel_utils";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import {
  formLabelClass,
  inputFieldClass,
  pageEyebrowClass,
  pageShellClass,
  pageSubtitleClass,
  pageTitleClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/app/components/appCardStyles";
import { prospectSiteHref } from "@/app/prospection/prospection_utils";
import { ArrowLeft, ClipboardList, ExternalLink, Save, Trash2 } from "lucide-react";

interface AuditVisuelEditorProps {
  recordId: string;
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function AuditVisuelEditor({ recordId }: AuditVisuelEditorProps) {
  const router = useRouter();
  const [records, setRecords, ready] = useJsonBucket<AuditVisuelRecord[]>("audits-visuels", []);
  const [, setProspects] = useJsonBucket<Prospect[]>("prospection", []);
  const [copied, setCopied] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaInitRef = useRef<string>("");
  /** Dossier affiché tout de suite au clic ; le bucket est mis à jour en différé (évite la latence UI). */
  const [localDossier, setLocalDossier] = useState<AuditVisuelDossier | null>(null);
  const dossierLoadedForIdRef = useRef<string | null>(null);

  const record = useMemo(() => records.find((r) => r.id === recordId), [records, recordId]);

  const [titre, setTitre] = useState("");
  const [siteWeb, setSiteWeb] = useState("");

  const dossierAffiche = localDossier ?? record?.dossier;

  useEffect(() => {
    if (!record) return;
    if (metaInitRef.current === recordId) return;
    metaInitRef.current = recordId;
    setTitre(record.titre);
    setSiteWeb(record.siteWeb ?? "");
  }, [record, recordId]);

  useEffect(() => {
    if (!ready || !recordId) return;
    const r = records.find((x) => x.id === recordId);
    if (!r) return;
    if (dossierLoadedForIdRef.current !== recordId) {
      dossierLoadedForIdRef.current = recordId;
      setLocalDossier(r.dossier);
    }
  }, [ready, recordId, records]);

  const persistPartial = useCallback(
    (patch: Partial<Pick<AuditVisuelRecord, "titre" | "siteWeb" | "dossier">>) => {
      setRecords((list) => {
        const current = list.find((x) => x.id === recordId);
        if (!current) return list;
        const now = new Date().toISOString();
        const next: AuditVisuelRecord = {
          ...current,
          titre: patch.titre !== undefined ? patch.titre : current.titre,
          siteWeb: patch.siteWeb !== undefined ? patch.siteWeb || undefined : current.siteWeb,
          dossier: patch.dossier ?? current.dossier,
          updatedAt: now,
        };
        return upsertAuditRecord(list, next);
      });
    },
    [recordId, setRecords]
  );

  const scheduleSaveDossier = useCallback(
    (d: AuditVisuelDossier) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        persistPartial({ dossier: d });
        saveTimer.current = null;
      }, 200);
    },
    [persistPartial]
  );

  const onDossierChange = useCallback(
    (d: AuditVisuelDossier) => {
      setLocalDossier(d);
      scheduleSaveDossier(d);
    },
    [scheduleSaveDossier]
  );

  const saveMeta = () => {
    if (!record) return;
    persistPartial({ titre: titre.trim() || "Sans titre", siteWeb: siteWeb.trim() || undefined });
  };

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    []
  );

  const remove = () => {
    if (!confirm("Supprimer cet audit ? La fiche prospect sera aussi mise à jour si elle était liée.")) return;
    const row = records.find((a) => a.id === recordId);
    const now = new Date().toISOString();
    if (row?.prospectId) {
      setProspects((ps) =>
        ps.map((p) => (p.id === row.prospectId ? { ...p, auditVisuel: undefined, updatedAt: now } : p))
      );
    }
    setRecords((list) => deleteAuditRecord(list, recordId));
    router.replace("/audit-visuel");
  };

  const prospectPid = record ? prospectIdFromRecordId(record.id) : null;
  const siteHref = prospectSiteHref(siteWeb);

  const exportTxt = useMemo(() => {
    const src = localDossier ?? record?.dossier;
    if (!src) return "";
    const g = src.generated;
    return [
      `${titre || record?.titre || "Audit visuel"}`,
      siteWeb ? `Site : ${siteWeb}` : "",
      "",
      `Note : ${g.noteSur100}/100 (${g.labelNote})`,
      "",
      "Faiblesses principales :",
      ...g.faiblessesPrincipales.map((l, i) => `${i + 1}. ${l}`),
      "",
      "Synthèse courte :",
      g.syntheseCourte,
      "",
      "Synthèse approfondie :",
      g.synthesePremium,
      "",
      "Arguments commerciaux :",
      ...g.argumentsCommerciaux.map((l) => `• ${l}`),
      "",
      "Priorités de refonte :",
      ...g.prioritesRefonte.map((l) => l),
    ]
      .filter(Boolean)
      .join("\n");
  }, [localDossier, record, titre, siteWeb]);

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportTxt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!ready) {
    return (
      <div className={`${pageShellClass} flex min-h-[40vh] items-center justify-center`}>
        <p className="text-sm text-zinc-500">Chargement de l&apos;audit…</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className={`${pageShellClass} mx-auto max-w-lg py-16 text-center`}>
        <h1 className={pageTitleClass}>Audit introuvable</h1>
        <p className={`${pageSubtitleClass} mx-auto`}>
          Cet audit n&apos;existe plus ou l&apos;identifiant est invalide.
        </p>
        <Link href="/audit-visuel" className={`${primaryButtonClass} mt-6 inline-flex`}>
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className={`${pageShellClass} pb-16`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={pageEyebrowClass}>
              <span className="text-[#c26500] dark:text-[#8fa9c9]">Finance · Audit visuel</span>
            </p>
            <h1 className={pageTitleClass}>Éditer l&apos;audit</h1>
            <p className={pageSubtitleClass}>
              Les changements sur la grille sont enregistrés automatiquement. Ajustez le titre ou l&apos;URL pour vos
              exports.
            </p>
            {record.updatedAt ? (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                Dernière mise à jour · {dateFmt.format(new Date(record.updatedAt))}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/audit-visuel" className={`${secondaryButtonClass} inline-flex items-center gap-2`}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Liste des audits
            </Link>
            {prospectPid ? (
              <Link
                href="/prospection"
                className={`${secondaryButtonClass} inline-flex items-center gap-2 border-emerald-500/30 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/90 dark:border-emerald-500/25 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-950/50`}
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Voir la prospection
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-zinc-50/90 to-[#ED8600]/[0.06] p-5 shadow-sm dark:border-white/[0.08] dark:from-[#12131a] dark:via-[#101119] dark:to-[#ED8600]/[0.04] sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={formLabelClass} htmlFor="audit-titre">
                Titre de l&apos;audit
              </label>
              <input
                id="audit-titre"
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                onBlur={saveMeta}
                className={inputFieldClass}
                placeholder="Ex. Site vitrine — Plomberie Martin"
              />
            </div>
            <div>
              <label className={formLabelClass} htmlFor="audit-site">
                Site web (optionnel)
              </label>
              <input
                id="audit-site"
                type="text"
                inputMode="url"
                value={siteWeb}
                onChange={(e) => setSiteWeb(e.target.value)}
                onBlur={saveMeta}
                className={inputFieldClass}
                placeholder="exemple.fr"
              />
              {siteHref ? (
                <a
                  href={siteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#c26500] underline underline-offset-2 dark:text-[#a8c0e0]"
                >
                  Ouvrir le site <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : null}
            </div>
            <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={saveMeta}
                className={`${secondaryButtonClass} inline-flex items-center justify-center gap-2`}
              >
                <Save className="h-4 w-4" aria-hidden />
                Enregistrer titre & URL
              </button>
              <button
                type="button"
                onClick={() => void copyExport()}
                className={`${secondaryButtonClass} inline-flex items-center justify-center gap-2 border-violet-300/60 bg-violet-50/90 text-violet-900 hover:bg-violet-100 dark:border-violet-500/25 dark:bg-violet-950/40 dark:text-violet-200`}
              >
                <ClipboardList className="h-4 w-4" aria-hidden />
                {copied ? "Copié !" : "Copier le texte"}
              </button>
            </div>
          </div>
          {prospectPid ? (
            <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-500/15 dark:bg-emerald-950/25 dark:text-emerald-200/95">
              Cet audit est lié à une fiche prospect — les mêmes données sont synchronisées lorsque vous enregistrez la
              fiche depuis Prospection.
            </p>
          ) : (
            <p className="mt-4 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 text-xs text-zinc-600 dark:border-white/[0.08] dark:bg-zinc-800/40 dark:text-zinc-400">
              Audit indépendant : retrouvez-le dans la liste principale ou créez une variante via « Nouvel audit ».
            </p>
          )}
        </div>

        {dossierAffiche ? (
          <AuditVisuelBlock
            key={recordId}
            value={dossierAffiche}
            onChange={onDossierChange}
            entrepriseHint={titre.trim() || record.titre.trim() || undefined}
          />
        ) : null}

        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-zinc-200/80 pt-8 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-300/60 bg-rose-50/90 px-4 py-2.5 text-sm font-medium text-rose-800 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Supprimer cet audit
          </button>
          <Link href="/audit-visuel" className={`${primaryButtonClass} inline-flex items-center gap-2`}>
            Terminé — retour à la liste
          </Link>
        </div>
      </div>
    </div>
  );
}
