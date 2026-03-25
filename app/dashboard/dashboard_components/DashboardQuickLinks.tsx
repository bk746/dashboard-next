import Link from "next/link";
import { secondaryButtonClass, panelSurfaceClass } from "@/app/components/appCardStyles";

const links = [
  { href: "/finance", label: "Finance" },
  { href: "/clients", label: "Clients" },
  { href: "/deals-projets", label: "Deals / Projets" },
  { href: "/objectifs", label: "Objectifs" },
] as const;

export default function DashboardQuickLinks() {
  return (
    <div className={`${panelSurfaceClass} px-4 py-4 sm:px-5 sm:py-4`}>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-3">Accès rapides</p>
      <div className="flex flex-wrap gap-2">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className={`${secondaryButtonClass} !px-4 !py-2 text-sm`}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
