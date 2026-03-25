"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { DATA_BUCKET_KEYS } from "@/lib/data/bucketKeys";
import { registerBucketWriter } from "@/lib/syncBridge";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export type DataSyncContextValue = {
  ready: boolean;
  buckets: Record<string, string>;
  setBucket: (key: string, json: string) => Promise<void>;
};

const DataSyncContext = createContext<DataSyncContextValue | null>(null);

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [buckets, setBuckets] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  const cloud = isSupabaseConfigured();

  useEffect(() => {
    if (authLoading) return;

    if (!cloud) {
      const next: Record<string, string> = {};
      if (typeof window !== "undefined") {
        for (const k of DATA_BUCKET_KEYS) {
          const v = localStorage.getItem(k);
          if (v) next[k] = v;
        }
      }
      setBuckets(next);
      setReady(true);
      return;
    }

    if (!user) {
      setBuckets({});
      setReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase!
        .from("data_buckets")
        .select("bucket_key, payload")
        .eq("user_id", user.id);

      if (cancelled) return;

      if (error) {
        const msg =
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: string }).message)
            : String(error);
        const code =
          typeof error === "object" && error !== null && "code" in error
            ? String((error as { code?: string }).code)
            : "";
        console.warn(
          "[FinPilot] Lecture cloud impossible — données locales utilisées.",
          msg || code || "Erreur inconnue",
          "— Exécute supabase/migrations/001_data_buckets.sql dans Supabase (SQL Editor) si la table n’existe pas."
        );
        const next: Record<string, string> = {};
        for (const k of DATA_BUCKET_KEYS) {
          const v = localStorage.getItem(k);
          if (v) next[k] = v;
        }
        setBuckets(next);
        setReady(true);
        return;
      }

      const next: Record<string, string> = {};
      for (const row of data ?? []) {
        next[row.bucket_key] =
          typeof row.payload === "string" ? row.payload : JSON.stringify(row.payload);
      }

      for (const k of DATA_BUCKET_KEYS) {
        if (next[k]) continue;
        const local = localStorage.getItem(k);
        if (local) {
          try {
            await supabase!.from("data_buckets").upsert({
              user_id: user.id,
              bucket_key: k,
              payload: JSON.parse(local),
              updated_at: new Date().toISOString(),
            });
            next[k] = local;
          } catch (e) {
            console.error("migrate bucket", k, e);
          }
        }
      }

      for (const [k, v] of Object.entries(next)) {
        localStorage.setItem(k, v);
      }

      setBuckets(next);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, cloud]);

  const setBucket = useCallback(
    async (key: string, json: string) => {
      setBuckets((prev) => ({ ...prev, [key]: json }));
      if (typeof window !== "undefined") {
        localStorage.setItem(key, json);
        try {
          window.dispatchEvent(new CustomEvent("finpilot-data-updated", { detail: { key } }));
        } catch {
          /* ignore */
        }
      }
      if (!cloud || !user || !supabase) return;
      try {
        const { error } = await supabase.from("data_buckets").upsert({
          user_id: user.id,
          bucket_key: key,
          payload: JSON.parse(json),
          updated_at: new Date().toISOString(),
        });
        if (error) {
          const msg =
            typeof error === "object" && error !== null && "message" in error
              ? String((error as { message?: string }).message)
              : String(error);
          console.warn("[FinPilot] Sauvegarde cloud impossible pour", key + ":", msg);
        }
      } catch (e) {
        console.error("data_buckets upsert parse", key, e);
      }
    },
    [cloud, user]
  );

  const value = useMemo<DataSyncContextValue>(
    () => ({ ready, buckets, setBucket }),
    [ready, buckets, setBucket]
  );

  useEffect(() => {
    registerBucketWriter(setBucket);
    return () => registerBucketWriter(null);
  }, [setBucket]);

  return <DataSyncContext.Provider value={value}>{children}</DataSyncContext.Provider>;
}

export function useDataSync() {
  const ctx = useContext(DataSyncContext);
  if (!ctx) throw new Error("useDataSync doit être utilisé dans DataSyncProvider");
  return ctx;
}
