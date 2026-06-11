"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isPushSupported, isStandalonePwa, urlBase64ToUint8Array } from "@/lib/push/client";

export type PushStatus =
  | "unsupported"
  | "no_cloud"
  | "ios_needs_install"
  | "idle"
  | "denied"
  | "subscribed"
  | "loading"
  | "error";

export function usePushNotifications() {
  const { session, user } = useAuth();
  const [status, setStatus] = useState<PushStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const cloud = isSupabaseConfigured();

  const refreshStatus = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    if (!cloud || !user) {
      setStatus("no_cloud");
      return;
    }
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isStandalonePwa()) {
      setStatus("ios_needs_install");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "subscribed" : "idle");
    } catch {
      setStatus("idle");
    }
  }, [cloud, user]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const authHeaders = useCallback((): HeadersInit => {
    const token = session?.access_token;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [session]);

  const subscribe = useCallback(async () => {
    setError(null);
    setStatus("loading");

    try {
      const keyRes = await fetch("/api/push/vapid-public-key");
      if (!keyRes.ok) {
        throw new Error("Notifications non configurées sur le serveur.");
      }
      const { publicKey } = (await keyRes.json()) as { publicKey: string };

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        throw new Error("Permission refusée — autorisez les notifications dans Réglages.");
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
      }

      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(json),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Erreur ${res.status}`);
      }

      setStatus("subscribed");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setError(msg);
      await refreshStatus();
    }
  }, [authHeaders, refreshStatus]);

  const unsubscribe = useCallback(async () => {
    setError(null);
    setStatus("loading");

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }

      setStatus("idle");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setError(msg);
      setStatus("error");
    }
  }, [authHeaders]);

  const sendTest = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/push/test", {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      const msg = payload?.error ?? `Erreur ${res.status}`;
      setError(msg);
      throw new Error(msg);
    }
  }, [authHeaders]);

  return {
    status,
    error,
    subscribe,
    unsubscribe,
    sendTest,
    refreshStatus,
    cloud,
    user,
  };
}
