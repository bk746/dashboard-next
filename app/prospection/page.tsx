"use client";

import { useMemo, useState } from "react";
import type { Prospect, ProspectReponseClient } from "@/app/types";
import { useJsonBucket } from "@/hooks/useJsonBucket";
import {
  pageShellClass,
  pageEyebrowClass,
  pageTitleClass,
  pageSubtitleClass,
  pageDividerClass,
  primaryButtonClass,
  sectionIntroTitleClass,
  sectionIntroDescClass,
} from "@/app/components/appCardStyles";
import {
  auditPasEncoreEnvoye,
  besoinRelanceAppelSemaine,
  besoinRelanceMailJ3,
  listeRendezVousAVenir,
  migrateProspect,
} from "@/app/prospection/prospection_utils";
import ProspectForm from "./prospection_components/ProspectForm";
import ProspectsTable from "./prospection_components/ProspectsTable";
import RendezVousAVenirCard from "./prospection_components/RendezVousAVenirCard";
import RelancesKpiCards from "./prospection_components/RelancesKpiCards";

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
      prospects.map((x) =>
        x.id === p.id
          ? migrateProspect({ ...x, reponseClient: reponse, updatedAt: new Date().toISOString() })
          : x
      )
    );
  };

  const prospectsM = useMemo(() => prospects.map(migrateProspect), [prospects]);

  const { auditsAEnvoyer, relancesMailAFaire, relancesAppelAFaire } = useMemo(() => {
    return {
      auditsAEnvoyer: prospectsM.filter((p) => auditPasEncoreEnvoye(p)).length,
      relancesMailAFaire: prospectsM.filter((p) => besoinRelanceMailJ3(p)).length,
      relancesAppelAFaire: prospectsM.filter((p) => besoinRelanceAppelSemaine(p)).length,
    };
  }, [prospectsM]);

  const rendezVousAVenir = useMemo(() => listeRendezVousAVenir(prospectsM), [prospectsM]);

  return (
    <div className={pageShellClass}>
      <div className="md:max-w-[1600px] md:mx-auto">
        <header className="px-4 sm:px-6 md:px-0 mb-7 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className={pageEyebrowClass}>Commercial</p>
              <h1 className={pageTitleClass}>Prospection</h1>
              <p className={pageSubtitleClass}>
                Étape du contact (audit, mail, appel) et réponse à part (en attente par défaut, validé ou refusé). Relance
                mail J+3 après audit, appel 7 j après le mail. RDV planifiables sur la fiche.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className={primaryButtonClass}
            >
              Nouveau prospect
            </button>
          </div>
          <div className={pageDividerClass} aria-hidden />
        </header>

        <section className="px-4 sm:px-6 md:px-0 mb-8 md:mb-10" aria-label="Rendez-vous à venir">
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

        <section className="px-4 sm:px-6 md:px-0 mb-8 md:mb-10" aria-label="Relances à traiter">
          <div className="mb-4">
            <h2 className={sectionIntroTitleClass}>Priorités relances</h2>
            <p className={sectionIntroDescClass}>
              D&apos;abord les audits pas encore datés, puis les relances mail (J+3 après audit) et appel (7 j après le
              mail de relance).
            </p>
          </div>
          <RelancesKpiCards
            auditsAEnvoyer={auditsAEnvoyer}
            relancesMailAFaire={relancesMailAFaire}
            relancesAppelAFaire={relancesAppelAFaire}
          />
        </section>

        <div className="px-4 sm:px-6 md:px-0">
          <ProspectsTable
            prospects={prospectsM}
            onEdit={(p) => {
              setEditing(p);
              setShowForm(true);
            }}
            onDelete={deleteProspect}
            onReponseChange={updateReponseProspect}
          />
        </div>
      </div>

      {showForm && (
        <ProspectForm
          prospect={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={saveProspect}
        />
      )}
    </div>
  );
}
