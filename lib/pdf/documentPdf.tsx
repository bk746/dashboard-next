/**
 * Génération PDF native (devis / factures) via @react-pdf/renderer.
 * Module volumineux : à importer uniquement en dynamique (`await import(...)`)
 * pour ne pas alourdir le bundle principal.
 */

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { CompanySettings } from "@/app/config/company";
import { formatCompanyAddressLine } from "@/app/config/company";

export interface DocumentPdfLigne {
  designation: string;
  /** Montant affiché (déjà formaté) ; « Inclus » pour les lignes forfait. */
  montant: string;
  inclus?: boolean;
}

export interface DocumentPdfData {
  kind: "devis" | "facture";
  numero: string;
  date: string;
  /** Devis uniquement. */
  validite?: string;
  /** Facture uniquement. */
  statut?: string;
  dateEcheance?: string;
  entreprise: string;
  clientNom?: string;
  clientEmail?: string;
  clientTelephone?: string;
  lignes: DocumentPdfLigne[];
  totalLabel: string;
  acompteLabel?: string;
  resteLabel?: string;
  company: CompanySettings;
}

const C = {
  text: "#18181b",
  muted: "#71717a",
  faint: "#a1a1aa",
  line: "#e4e4e7",
  lineDark: "#18181b",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: C.text,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 26, fontFamily: "Helvetica-Bold", letterSpacing: -0.5 },
  metaRow: { flexDirection: "row", marginTop: 4 },
  metaLabel: { color: C.muted, width: 52 },
  metaValue: { fontFamily: "Helvetica-Bold" },
  companyBlock: { alignItems: "flex-end", maxWidth: 220 },
  companyName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  companyLine: { color: C.muted, marginTop: 2, textAlign: "right", fontSize: 9 },
  sectionDivider: { borderTopWidth: 1, borderTopColor: C.line, marginTop: 28, paddingTop: 20 },
  smallLabel: { fontSize: 8, color: C.faint, textTransform: "uppercase", letterSpacing: 0.5 },
  clientName: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 6 },
  clientLine: { color: C.muted, marginTop: 2 },
  table: { marginTop: 28 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingBottom: 8,
  },
  th: { fontSize: 8, color: C.faint, textTransform: "uppercase", letterSpacing: 0.5 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
    paddingVertical: 12,
  },
  cellDesignation: { flex: 1, paddingRight: 12 },
  cellMontant: { width: 90, textAlign: "right", fontFamily: "Helvetica-Bold" },
  cellMontantInclus: { width: 90, textAlign: "right", color: C.faint },
  totalsBlock: { marginTop: 28, alignItems: "flex-end" },
  totalsInner: { width: 220 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1.5,
    borderTopColor: C.lineDark,
    paddingTop: 12,
  },
  totalLabel: { color: C.muted },
  totalValue: { fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: -0.3 },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  paymentBlock: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 16,
  },
  paymentLine: { color: C.muted, marginTop: 3 },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 12,
  },
  footerText: { fontSize: 8, color: C.faint, lineHeight: 1.5 },
  signature: { marginTop: 36, alignItems: "flex-end" },
  signatureLine: { width: 160, borderBottomWidth: 1, borderBottomColor: "#d4d4d8", marginTop: 36 },
});

function DocumentPdf({ data }: { data: DocumentPdfData }) {
  const { company } = data;
  const isFacture = data.kind === "facture";
  const titre = isFacture ? "Facture" : "Devis";

  return (
    <Document
      title={`${titre} ${data.numero}`}
      author={company.denomination}
      subject={`${titre} ${data.numero} — ${data.entreprise}`}
    >
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{titre}</Text>
            <View style={{ marginTop: 10 }}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>N°</Text>
                <Text style={styles.metaValue}>{data.numero}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text>{data.date}</Text>
              </View>
              {isFacture && data.dateEcheance ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Échéance</Text>
                  <Text>{data.dateEcheance}</Text>
                </View>
              ) : null}
              {!isFacture && data.validite ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Validité</Text>
                  <Text>{data.validite}</Text>
                </View>
              ) : null}
              {isFacture && data.statut ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Statut</Text>
                  <Text style={styles.metaValue}>{data.statut}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{company.denomination}</Text>
            <Text style={styles.companyLine}>
              {company.formeJuridique}
              {company.siret ? ` — SIRET ${company.siret}` : ""}
            </Text>
            <Text style={styles.companyLine}>{formatCompanyAddressLine(company)}</Text>
            <Text style={styles.companyLine}>
              {company.email}
              {company.telephone ? ` — ${company.telephone}` : ""}
            </Text>
            {company.tva ? <Text style={styles.companyLine}>{company.tva}</Text> : null}
          </View>
        </View>

        {/* Client */}
        <View style={styles.sectionDivider}>
          <Text style={styles.smallLabel}>{isFacture ? "Facturé à" : "Adressé à"}</Text>
          <Text style={styles.clientName}>{data.entreprise}</Text>
          {data.clientNom ? <Text style={styles.clientLine}>{data.clientNom}</Text> : null}
          {data.clientEmail ? <Text style={styles.clientLine}>{data.clientEmail}</Text> : null}
          {data.clientTelephone ? <Text style={styles.clientLine}>{data.clientTelephone}</Text> : null}
        </View>

        {/* Lignes */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1 }]}>Désignation</Text>
            <Text style={[styles.th, { width: 90, textAlign: "right" }]}>Montant TTC</Text>
          </View>
          {data.lignes.map((l, i) => (
            <View key={i} style={styles.row} wrap={false}>
              <Text style={[styles.cellDesignation, l.inclus ? { color: C.muted, paddingLeft: 12 } : {}]}>
                {l.designation}
              </Text>
              <Text style={l.inclus ? styles.cellMontantInclus : styles.cellMontant}>{l.montant}</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsInner}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total TTC</Text>
              <Text style={styles.totalValue}>{data.totalLabel}</Text>
            </View>
            {data.acompteLabel ? (
              <View style={styles.subRow}>
                <Text style={styles.totalLabel}>Acompte versé</Text>
                <Text style={{ fontFamily: "Helvetica-Bold", color: C.muted }}>
                  − {data.acompteLabel}
                </Text>
              </View>
            ) : null}
            {data.resteLabel ? (
              <View
                style={[styles.subRow, { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 }]}
              >
                <Text style={styles.totalLabel}>Reste à payer</Text>
                <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold" }}>{data.resteLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Modalités de paiement (facture) ou signature (devis) */}
        {isFacture ? (
          <View style={styles.paymentBlock}>
            <Text style={styles.smallLabel}>Modalités de paiement</Text>
            {data.dateEcheance ? (
              <Text style={styles.paymentLine}>Paiement à réception, au plus tard le {data.dateEcheance}.</Text>
            ) : (
              <Text style={styles.paymentLine}>Paiement à réception de la facture.</Text>
            )}
            {company.iban ? (
              <Text style={styles.paymentLine}>
                Virement bancaire — IBAN : {company.iban}
                {company.bic ? ` — BIC : ${company.bic}` : ""}
              </Text>
            ) : null}
            <Text style={styles.paymentLine}>
              Tout retard de paiement entraîne des pénalités au taux légal en vigueur ainsi qu&apos;une
              indemnité forfaitaire de 40 € pour frais de recouvrement (art. L441-10 du Code de commerce).
            </Text>
          </View>
        ) : (
          <View style={styles.signature}>
            <Text style={styles.smallLabel}>Bon pour accord</Text>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 8, color: C.faint, marginTop: 6 }}>
              Date et signature du client
            </Text>
          </View>
        )}

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {company.denomination} — {company.formeJuridique}
            {company.siret ? ` — SIRET ${company.siret}` : ""} — {formatCompanyAddressLine(company)}
          </Text>
          <Text style={styles.footerText}>
            {company.tva || "TVA non applicable, art. 293 B du CGI."} — Fait à {company.ville || "—"},
            le {data.date}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/** Génère le PDF en Blob (à appeler côté client uniquement). */
export async function generateDocumentPdfBlob(data: DocumentPdfData): Promise<Blob> {
  return pdf(<DocumentPdf data={data} />).toBlob();
}

export function documentPdfFilename(data: DocumentPdfData): string {
  const titre = data.kind === "facture" ? "Facture" : "Devis";
  const safe = data.numero.replace(/[^a-zA-Z0-9_-]+/g, "-");
  return `${titre}-${safe}.pdf`;
}
