"use client";

import { useCallback, useMemo } from "react";
import { useDataSync } from "@/context/DataSyncContext";

/**
 * État JSON synchronisé (localStorage + Supabase si connecté).
 * `defaultValue` sert au parse si la clé est absente.
 * Le setter accepte une valeur ou une fonction `(prev) => next` (comme useState).
 */
const defaultByKey = new Map<string, unknown>();

function getStableDefault<T>(key: string, defaultValue: T): T {
  if (!defaultByKey.has(key)) {
    defaultByKey.set(key, defaultValue);
  }
  return defaultByKey.get(key) as T;
}

function parseBucket<T>(raw: string | undefined | null, def: T): T {
  if (raw == null || raw === "") return def;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return def;
  }
}

export function useJsonBucket<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const { buckets, setBucket, ready } = useDataSync();
  const raw = buckets[key];
  const def = getStableDefault(key, defaultValue);

  const value = useMemo(() => parseBucket(raw, def), [raw, def]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = parseBucket(buckets[key], def);
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      void setBucket(key, JSON.stringify(resolved));
    },
    [key, setBucket, buckets, def]
  );

  return [value, setValue, ready];
}
