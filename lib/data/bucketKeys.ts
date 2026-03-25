/** Clés synchronisées avec Supabase (table `data_buckets`) + localStorage. */
export const DATA_BUCKET_KEYS = [
  "clients",
  "factures",
  "devis",
  "depenses",
  "objectifs",
  "projets",
  "estimations",
  "companySettings",
] as const;

export type DataBucketKey = (typeof DATA_BUCKET_KEYS)[number];
