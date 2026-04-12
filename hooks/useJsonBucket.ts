"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDataSync } from "@/context/DataSyncContext";

/**
 * État JSON synchronisé (localStorage + Supabase si connecté).
 * `defaultValue` sert au parse si la clé est absente.
 * Le setter accepte une valeur ou une fonction `(prev) => next` (comme useState).
 */
export function useJsonBucket<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const { buckets, setBucket, ready } = useDataSync();
  const raw = buckets[key];

  /**
   * Les littéraux `[]` / `{}` passés en default changent de référence à chaque rendu parent.
   * Les inclure dans useMemo recréait la valeur à chaque frame → effets qui dépendent de la
   * donnée (ex. migration audit) rappelaient setBucket en boucle (maximum update depth).
   */
  const defaultForKeyRef = useRef<{ key: string; val: T } | null>(null);
  if (!defaultForKeyRef.current || defaultForKeyRef.current.key !== key) {
    defaultForKeyRef.current = { key, val: defaultValue };
  }

  const value = useMemo(() => {
    const def = defaultForKeyRef.current!.val;
    if (raw == null || raw === "") return def;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return def;
    }
  }, [raw, key]);

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;
      void setBucket(key, JSON.stringify(resolved));
    },
    [key, setBucket]
  );

  return [value, setValue, ready];
}
