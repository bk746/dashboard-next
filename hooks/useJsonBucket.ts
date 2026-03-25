"use client";

import { useCallback, useMemo } from "react";
import { useDataSync } from "@/context/DataSyncContext";

/**
 * État JSON synchronisé (localStorage + Supabase si connecté).
 * `defaultValue` sert au parse si la clé est absente.
 */
export function useJsonBucket<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, boolean] {
  const { buckets, setBucket, ready } = useDataSync();
  const raw = buckets[key];

  const value = useMemo(() => {
    if (raw == null || raw === "") return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }, [raw, defaultValue]);

  const setValue = useCallback(
    (next: T) => {
      void setBucket(key, JSON.stringify(next));
    },
    [key, setBucket]
  );

  return [value, setValue, ready];
}
