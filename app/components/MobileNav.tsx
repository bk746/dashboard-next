"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Briefcase,
  Target,
  Settings,
  Menu,
  X,
  Calculator,
  type LucideIcon,
} from "lucide-react";

const mainItems: { href: string; label: string; icon: LucideIcon; indent?: boolean }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/estimation", label: "Estimation", icon: Calculator, indent: true },
  { href: "/deals-projets", label: "Deals / Projets", icon: Briefcase },
  { href: "/objectifs", label: "Objectifs", icon: Target },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const linkRow = (
    href: string,
    label: string,
    Icon: LucideIcon,
    onNavigate: () => void,
    indent?: boolean
  ) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={`
          group flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200
          ${indent ? "pl-6 pr-3 ml-1 border-l border-zinc-200/80 dark:border-white/[0.08]" : "px-3"}
          ${
            active
              ? "bg-[#ED8600]/10 text-[#c2410c] dark:bg-white/[0.06] dark:text-[#b8c9d9]"
              : "text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
          }
        `}
      >
        <span
          className={`
            flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors
            ${
              active
                ? "border-[#ED8600]/25 bg-[#ED8600]/10 text-[#ED8600] dark:border-[#8fa9c9]/25 dark:bg-[#8fa9c9]/10 dark:text-[#8fa9c9]"
                : "border-zinc-200/80 bg-zinc-50 text-zinc-500 group-hover:border-zinc-300 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-500 dark:group-hover:border-white/[0.1]"
            }
          `}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/90 dark:border-white/[0.06] bg-[#f8f8f7] dark:bg-[#0a0a0c] shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-semibold tracking-tight">
            <span className="text-[#ED8600] dark:text-[#8fa9c9]">BK</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium"> Copilot</span>
          </h1>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`md:hidden fixed top-0 right-0 h-full w-[min(18rem,100vw)] z-50 flex flex-col
          border-l border-zinc-200/90 dark:border-white/[0.06]
          bg-[#f8f8f7] dark:bg-[#0a0a0c]
          shadow-[-8px_0_40px_rgba(0,0,0,0.12)] dark:shadow-[-8px_0_48px_rgba(0,0,0,0.45)]
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 mb-1">
              Menu
            </p>
            <h2 className="text-base font-semibold tracking-tight">
              <span className="text-[#ED8600] dark:text-[#8fa9c9]">BK</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium"> Copilot</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto space-y-1" aria-label="Navigation">
          {mainItems.map((item) => (
            <div key={item.href}>
              {linkRow(item.href, item.label, item.icon, () => setIsOpen(false), item.indent)}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-100 dark:border-white/[0.06]">
          {linkRow("/parametres", "Paramètres", Settings, () => setIsOpen(false))}
        </div>
      </aside>
    </>
  );
}
