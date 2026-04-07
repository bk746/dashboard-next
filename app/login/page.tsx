"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  pageShellClass,
  pageTitleClass,
  pageSubtitleClass,
  inputFieldClass,
  formLabelClass,
  primaryButtonClass,
  panelSurfaceClass,
} from "@/app/components/appCardStyles";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className={pageShellClass}>
        <div className="max-w-md mx-auto px-4 py-16">
          <h1 className={pageTitleClass}>Connexion</h1>
          <p className={pageSubtitleClass}>
            Supabase n&apos;est pas configuré sur ce déploiement. En production, ajoutez dans{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">Vercel</strong> → votre projet →{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">Settings → Environment Variables</strong>{" "}
            les clés{" "}
            <code className="text-xs font-mono">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
            <code className="text-xs font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (copiées depuis Supabase →
            Project Settings → API), puis faites un <strong className="font-medium">Redeploy</strong>. En local,
            utilisez <code className="text-xs font-mono">.env.local</code>. Créez aussi la table{" "}
            <code className="text-xs font-mono">data_buckets</code> (fichier{" "}
            <code className="text-xs font-mono">supabase/migrations/001_data_buckets.sql</code> dans l&apos;éditeur
            SQL Supabase).
          </p>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Une seule app Vercel doit être liée au repo : évitez d&apos;importer le même projet plusieurs fois, sinon
            les variables ne sont pas recopiées.
          </p>
          <button type="button" className={`${primaryButtonClass} mt-6`} onClick={() => router.push("/dashboard")}>
            Continuer en local
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);
    if (mode === "signin") {
      const { error: err } = await signIn(email.trim(), password);
      setPending(false);
      if (err) {
        setError(err.message);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    const { error: err, needsEmailConfirmation } = await signUp(email.trim(), password);
    setPending(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (needsEmailConfirmation) {
      setInfo(
        "Un email de confirmation t’a été envoyé. Ouvre le lien dans l’email : tu seras redirigé vers cette app. Si la page reste vide, vérifie dans Supabase : Authentication → URL Configuration → ajoute http://localhost:3000/** (en local)."
      );
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className={pageShellClass}>
      <div className="max-w-md mx-auto px-4 py-12 md:py-20">
        <div className={`${panelSurfaceClass} p-6 md:p-8`}>
          <h1 className={pageTitleClass}>FinPilot</h1>
          <p className={pageSubtitleClass}>
            {mode === "signin"
              ? "Connectez-vous pour synchroniser vos données dans le cloud."
              : "Créez un compte — vos données seront sauvegardées sur Supabase."}
          </p>

          <div className="flex gap-2 mt-6 mb-6">
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                mode === "signin"
                  ? "bg-[#ED8600]/20 text-[#ED8600] dark:bg-[#8fa9c9]/15 dark:text-[#8fa9c9]"
                  : "text-zinc-500 hover:bg-white/[0.04]"
              }`}
              onClick={() => setMode("signin")}
            >
              Connexion
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                mode === "signup"
                  ? "bg-[#ED8600]/20 text-[#ED8600] dark:bg-[#8fa9c9]/15 dark:text-[#8fa9c9]"
                  : "text-zinc-500 hover:bg-white/[0.04]"
              }`}
              onClick={() => setMode("signup")}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={formLabelClass} htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputFieldClass}
              />
            </div>
            <div>
              <label className={formLabelClass} htmlFor="login-password">
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputFieldClass}
              />
            </div>
            {info && <p className="text-sm text-emerald-400/90">{info}</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
              {pending ? "Patientez…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
