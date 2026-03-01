"use client";

import { usePathname } from "next/navigation";

/**
 * Force le remontage du contenu à chaque changement de route.
 * Évite d'afficher des données en cache (ex: localStorage) d'une page précédente.
 */
export default function CacheBuster({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return <div key={pathname}>{children}</div>;
}
