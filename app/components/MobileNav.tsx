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
  ClipboardList,
  LogIn,
  LogOut,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const sidebarGradient = "bg-white/85 backdrop-blur-xl ring-1 ring-black/[0.05]";

const sidebarShadow = "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]";

const mainItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/prospection", label: "Prospection", icon: ClipboardList },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/estimation", label: "Estimation", icon: Calculator },
  { href: "/deals-projets", label: "Deals / Projets", icon: Briefcase },
  { href: "/objectifs", label: "Objectifs", icon: Target },
];

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const cloud = isSupabaseConfigured();
  const settingsActive = pathname === "/parametres" || pathname.startsWith("/parametres/");

  const close = () => setIsOpen(false);

  const linkRow = (href: string, label: string, Icon: LucideIcon, active: boolean) => (
    <Link
      href={href}
      onClick={close}
      aria-current={active ? "page" : undefined}
      className={`
        group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200
        ${
          active
            ? "bg-[#007AFF]/12 text-[#007AFF]"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }
      `}
    >
      <span
        className={`
          flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors
          ${active ? "bg-[#007AFF]/15 text-[#007AFF]" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200/70"}
        `}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Barre du haut — même dégradé que la sidebar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#F5F5F7] px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <nav
          className={`flex items-center justify-between gap-3 rounded-[1.25rem] px-3 py-2.5 ${sidebarGradient} ${sidebarShadow}`}
          aria-label="Navigation mobile"
        >
          <Link
            href="/dashboard"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#007AFF] text-white transition-colors hover:bg-[#0066D6]"
            aria-label="Accueil BK Copilot"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </Link>

          <p className="min-w-0 flex-1 text-center text-sm font-semibold tracking-tight text-zinc-900">
            BK Copilot
          </p>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200/70"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isOpen ? (
              <X className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
        </nav>
      </header>

      {isOpen ? (
        <div
          className="md:hidden fixed inset-0 z-40 bg-zinc-950/25 backdrop-blur-[2px]"
          onClick={close}
          aria-hidden
        />
      ) : null}

      {/* Panneau burger — style sidebar */}
      <aside
        className={`
          md:hidden fixed top-0 right-0 z-50 flex h-full w-[min(17.5rem,88vw)] flex-col
          rounded-l-[2rem] ${sidebarGradient} ${sidebarShadow}
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"}
        `}
        aria-label="Menu principal"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">Menu</p>
            <p className="mt-0.5 text-base font-semibold text-zinc-900">BK Copilot</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200/70"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mx-5 h-px bg-zinc-200" aria-hidden />

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden">
          {mainItems.map((item) => (
            <div key={item.href}>
              {linkRow(item.href, item.label, item.icon, isNavActive(item.href, pathname))}
            </div>
          ))}
        </nav>

        <div className="mx-5 h-px bg-zinc-200" aria-hidden />

        <div className="space-y-2 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!cloud ? (
            <div className="rounded-2xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-200/70">
              <p className="text-[10px] leading-snug text-amber-700">
                Pas de sync cloud — ajoutez les variables sur Vercel.
              </p>
              <Link
                href="/login"
                onClick={close}
                className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-700"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden />
                Connexion &amp; aide
              </Link>
            </div>
          ) : user ? (
            <p className="truncate px-3 text-[10px] text-zinc-400" title={user.email ?? ""}>
              {user.email}
            </p>
          ) : null}

          {linkRow("/parametres", "Paramètres", Settings, settingsActive)}

          {cloud && user ? (
            <button
              type="button"
              onClick={() => {
                close();
                void signOut();
              }}
              className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200/70">
                <LogOut className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              Déconnexion
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}
