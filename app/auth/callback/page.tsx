"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/**
 * Page de retour après clic sur le lien de confirmation d’email (Supabase).
 * Doit rester hors RequireAuth pour que la session puisse être lue depuis l’URL.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Confirmation du compte…");

  useEffect(() => {
    const client = supabase;
    if (!client) {
      router.replace("/login");
      return;
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        router.replace("/dashboard");
      }
    });

    void client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      }
    });

    const timeout = window.setTimeout(() => {
      void client.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setStatus(
            "Impossible de confirmer automatiquement. Vérifie que l’URL de redirection est autorisée dans Supabase (Authentication → URL Configuration) et réessaie le lien depuis l’email, ou connecte-toi ci-dessous."
          );
        }
      });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] px-4 text-center gap-4">
      <p className="text-sm text-zinc-400 max-w-md">{status}</p>
      <Link href="/login" className="text-sm font-medium text-[#ED8600] dark:text-[#8fa9c9] hover:underline">
        Aller à la connexion
      </Link>
    </div>
  );
}
