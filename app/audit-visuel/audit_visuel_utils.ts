import type { AuditVisuelDossier, AuditVisuelRecord, Prospect } from "@/app/types";
import { buildAuditVisuelDossier, emptyAuditChecklist } from "@/app/audit-visuel/auditVisuelEngine";

export function prospectAuditRecordId(prospectId: string): string {
  return `prospect-${prospectId}`;
}

export function isProspectAuditRecordId(id: string): boolean {
  return id.startsWith("prospect-");
}

export function prospectIdFromRecordId(id: string): string | null {
  if (!isProspectAuditRecordId(id)) return null;
  return id.slice("prospect-".length) || null;
}

export function createStandaloneAuditRecord(
  titre: string,
  opts?: { siteWeb?: string; prospectId?: string }
): AuditVisuelRecord {
  const now = new Date().toISOString();
  const id =
    opts?.prospectId != null && opts.prospectId !== ""
      ? prospectAuditRecordId(opts.prospectId)
      : crypto.randomUUID();
  const titreTrim = titre.trim();
  const dossier = buildAuditVisuelDossier(emptyAuditChecklist(), "generique", {
    entreprise: titreTrim || undefined,
  });
  return {
    id,
    prospectId: opts?.prospectId || undefined,
    titre: titre.trim() || "Sans titre",
    siteWeb: opts?.siteWeb?.trim() || undefined,
    dossier,
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertAuditRecord(list: AuditVisuelRecord[], record: AuditVisuelRecord): AuditVisuelRecord[] {
  const i = list.findIndex((a) => a.id === record.id);
  if (i < 0) return [...list, record];
  const next = [...list];
  next[i] = record;
  return next;
}

export function upsertProspectAudit(
  list: AuditVisuelRecord[],
  prospect: Pick<Prospect, "id" | "entreprise" | "siteWeb">,
  dossier: AuditVisuelDossier
): AuditVisuelRecord[] {
  const id = prospectAuditRecordId(prospect.id);
  const now = new Date().toISOString();
  const idx = list.findIndex((a) => a.id === id);
  const row: AuditVisuelRecord = {
    id,
    prospectId: prospect.id,
    titre: prospect.entreprise.trim() || "Sans nom",
    siteWeb: prospect.siteWeb?.trim() || undefined,
    dossier,
    createdAt: idx >= 0 ? list[idx].createdAt : now,
    updatedAt: now,
  };
  return upsertAuditRecord(list, row);
}

export function removeProspectAudit(list: AuditVisuelRecord[], prospectId: string): AuditVisuelRecord[] {
  const id = prospectAuditRecordId(prospectId);
  return list.filter((a) => a.id !== id);
}

export function deleteAuditRecord(list: AuditVisuelRecord[], id: string): AuditVisuelRecord[] {
  return list.filter((a) => a.id !== id);
}
