"use client";

import Link from "next/link";
import { Wallet, Users, Briefcase, Target, type LucideIcon } from "lucide-react";

type QuickLink = {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

const links: QuickLink[] = [
  {
    href: "/finance",
    label: "Finance",
    hint: "Factures, devis, dépenses",
    icon: Wallet,
    iconBg: "bg-[#ED8600]/12",
    iconColor: "text-[#c2410c]",
  },
  {
    href: "/clients",
    label: "Clients",
    hint: "Fiches & abonnements",
    icon: Users,
    iconBg: "bg-sky-500/12",
    iconColor: "text-sky-700",
  },
  {
    href: "/deals-projets",
    label: "Deals & projets",
    hint: "Pipeline en cours",
    icon: Briefcase,
    iconBg: "bg-[#007AFF]/12",
    iconColor: "text-[#007AFF]",
  },
  {
    href: "/objectifs",
    label: "Objectifs",
    hint: "Progression & cibles",
    icon: Target,
    iconBg: "bg-emerald-500/12",
    iconColor: "text-emerald-700",
  },
];

const cardShadow = "shadow-[0_1px_2px_rgba(0,0,0,0.03)]";
const cardShadowHover = "hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.10)]";

export default function DashboardQuickLinks() {
  return (
    <section
      aria-label="Accès rapides"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
    >
      {links.map(({ href, label, hint, icon: Icon, iconBg, iconColor }) => (
        <Link
          key={href}
          href={href}
          className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05] px-4 py-3.5 ${cardShadow} transition-all duration-300 hover:-translate-y-1 ${cardShadowHover}`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${iconBg} ${iconColor}`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{label}</p>
            <p className="truncate text-[11px] text-zinc-500">{hint}</p>
          </div>
          <span
            aria-hidden
            className="ml-auto hidden text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-600 sm:inline"
          >
            →
          </span>
        </Link>
      ))}
    </section>
  );
}
