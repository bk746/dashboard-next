"use client";

import { useMemo, useState } from "react";
import { Plus, UserPlus, FileText, Bell, Sparkles } from "lucide-react";
import type { Prospect, ProspectReponseClient } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import DashboardToneKpiCard from "@/app/dashboard/dashboard_components/DashboardToneKpiCard";
import {
  auditPasEncoreEnvoye,
  besoinRelance,
  listeRendezVousAVenir,
  migrateProspect,
  prospectEnCours,
  todayDateISO,
} from "@/app/prospection/prospection_utils";
import ProspectForm from "./prospection_components/ProspectForm";
import ProspectsTable from "./prospection_components/ProspectsTable";
import RendezVousAVenirCard from "./prospection_components/RendezVousAVenirCard";

const prospectionShellClass =
  "min-h-screen w-full bg-white text-zinc-900 p-3 sm:p-4 md:p-8 md:px-10 lg:px-12";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5DD3] to-[#5E549E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(108,93,211,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(108,93,211,0.55)] w-full sm:w-auto";

export default function ProspectionPage() {
  const [prospects, setProspects] = useJsonBucket<Prospect[]>("prospection", []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Prospect | null>(null);

  const saveProspect = (p: Prospect) => {
    const toSave = migrateProspect(p);
    const exists = prospects.some((x) => x.id === toSave.id);
    if (exists) {
      setProspects(prospects.map((x) => (x.id === toSave.id ? toSave : x)));
    } else {
      setProspects([...prospects, toSave]);
    }
    setEditing(null);
    setShowForm(false);
  };

  const deleteProspect = (id: string) => {
    setProspects(prospects.filter((x) => x.id !== id));
  };

  const updateReponseProspect = (p: Prospect, reponse: ProspectReponseClient) => {
    setProspects(
      prospects.map((x) => {
        if (x.id !== p.id) return x;
        const patch: Partial<Prospect> = { reponseClient: reponse, updatedAt: new Date().toISOString() };
        if (reponse === "valide" || reponse === "refuse") patch.dateProchaineRelance = undefined;
        return migrateProspect({ ...x, ...patch });
      })
    );
  };

  const updateAuditFaitProspect = (p: Prospect, fait: boolean) => {
    setProspects(
      prospects.map((x) => {
        if (x.id !== p.id) return x;
        const patch: Partial<Prospect> = {
          dateAuditFait: fait ? todayDateISO() : undefined,
          updatedAt: new Date().toISOString(),
        };
        return migrateProspect({ ...x, ...patch });
      })
    );
  };

  const prospectsM = useMemo(() => prospects.map(migrateProspect), [prospects]);

  const { prospectsEnCours, auditsAEnvoyer, relancesAFaire } = useMemo(() => {
    return {
      prospectsEnCours: prospectsM.filter((p) => prospectEnCours(p)).length,
      auditsAEnvoyer: prospectsM.filter((p) => auditPasEncoreEnvoye(p)).length,
      relancesAFaire: prospectsM.filter((p) => besoinRelance(p)).length,
    };
  }, [prospectsM]);

  const rendezVousAVenir = useMemo(() => listeRendezVousAVenir(prospectsM), [prospectsM]);

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <div className={prospectionShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto space-y-6 md:space-y-8">
        <header className="px-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#6C5DD3]/12 text-[#6C5DD3]">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6C5DD3]/80">
                  Commercial
                </p>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#5E549E] sm:text-[28px] md:text-[32px]">
                Prospection
              </h1>
              <p className="mt-1 text-sm text-[#6C5DD3]/70 sm:text-[15px]">
                <span className="capitalize">{dateLabel}</span> · prospects, audits, appels et relances.
              </p>
            </div>

            <button type="button" onClick={openNew} className={primaryButtonClass}>
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Nouveau prospect
            </button>
          </div>
        </header>

        <section aria-label="Indicateurs prospection">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            <DashboardToneKpiCard
              tone="violet"
              label="Prospects en cours"
              subtitle="Réponse en attente"
              value={prospectsEnCours}
              icon={<UserPlus aria-hidden />}
            />
            <DashboardToneKpiCard
              tone="pink"
              label="Audit à faire"
              subtitle="Pas encore réalisé"
              value={auditsAEnvoyer}
              icon={<FileText aria-hidden />}
            />
            <DashboardToneKpiCard
              tone="pink"
              label="À relancer"
              subtitle="Échéance atteinte"
              value={relancesAFaire}
              icon={<Bell aria-hidden />}
            />
          </div>
        </section>

        <section aria-label="Rendez-vous à venir">
          <RendezVousAVenirCard
            items={rendezVousAVenir}
            onOpenProspect={(id) => {
              const p = prospectsM.find((x) => x.id === id);
              if (p) {
                setEditing(p);
                setShowForm(true);
              }
            }}
          />
        </section>

        <section aria-label="Liste des prospects">
          <ProspectsTable
            prospects={prospectsM}
            onEdit={(p) => {
              setEditing(p);
              setShowForm(true);
            }}
            onDelete={deleteProspect}
            onReponseChange={updateReponseProspect}
            onAuditFaitChange={updateAuditFaitProspect}
          />
        </section>
      </div>

      {showForm ? (
        <ProspectForm
          key={editing?.id ?? "nouveau-prospect"}
          prospect={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={saveProspect}
        />
      ) : null}
    </div>
  );
}
