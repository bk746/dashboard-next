/**
 * Permet aux modules non-React (ex. estimation_utils) de déclencher la même persistance
 * que useDataSync (localStorage + état React + Supabase).
 */
type BucketWriter = (key: string, json: string) => Promise<void>;

let bucketWriter: BucketWriter | null = null;

export function registerBucketWriter(fn: BucketWriter | null) {
  bucketWriter = fn;
}

export async function writeBucket(key: string, json: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (bucketWriter) {
    await bucketWriter(key, json);
  } else {
    localStorage.setItem(key, json);
    try {
      window.dispatchEvent(new CustomEvent("finpilot-data-updated", { detail: { key } }));
    } catch {
      /* ignore */
    }
  }
}
