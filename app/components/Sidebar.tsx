"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Briefcase,
  Target,
  Settings,
  Calculator,
  ClipboardList,
  LogOut,
  LogIn,
  Bell,
  type LucideIcon,
} from "lucide-react";

type NavIcon = { href: string; label: string; icon: LucideIcon };

const mainNav: NavIcon[] = [
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

function NavIconButton({
  href,
  label,
  icon: Icon,
  active,
}: NavIcon & { active: boolean }) {
  return (
    <li>
      <Link
        href={href}
        title={label}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={`
          flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200
          ${
            active
              ? "bg-[#007AFF]/12 text-[#007AFF]"
              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          }
        `}
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const cloud = isSupabaseConfigured();
  const settingsActive = pathname === "/parametres" || pathname.startsWith("/parametres/");

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-20 hidden h-screen w-[104px] md:block">
      <aside
        className="pointer-events-auto absolute left-4 top-5 flex h-[calc(100vh-2.5rem)] w-[72px] flex-col items-center rounded-[2rem] bg-white/80 py-5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.05] backdrop-blur-xl"
        aria-label="Navigation principale"
      >
        {/* Haut — raccourci / alertes */}
        <div className="flex flex-col items-center">
          <Link
            href="/dashboard"
            title="BK Copilot"
            aria-label="Accueil BK Copilot"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#007AFF] text-white transition-colors hover:bg-[#0066D6]"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>

        <div className="my-4 h-px w-8 bg-zinc-200" aria-hidden />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-2 [&::-webkit-scrollbar]:hidden">
          <ul className="flex flex-col items-center gap-1.5">
            {mainNav.map((item) => (
              <NavIconButton key={item.href} {...item} active={isNavActive(item.href, pathname)} />
            ))}
          </ul>
        </nav>

        <div className="my-3 h-px w-8 bg-zinc-200" aria-hidden />

        {/* Bas — paramètres & compte */}
        <div className="flex flex-col items-center gap-1.5">
          {!cloud ? (
            <Link
              href="/login"
              title="Connexion cloud"
              aria-label="Connexion cloud"
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-amber-500 transition-colors hover:bg-zinc-100"
            >
              <LogIn className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </Link>
          ) : null}

          <Link
            href="/parametres"
            title="Paramètres"
            aria-label="Paramètres"
            aria-current={settingsActive ? "page" : undefined}
            className={`
              flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200
              ${
                settingsActive
                  ? "bg-[#007AFF]/12 text-[#007AFF]"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              }
            `}
          >
            <Settings className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
          </Link>

          {cloud && user ? (
            <button
              type="button"
              title={`Déconnexion${user.email ? ` (${user.email})` : ""}`}
              aria-label="Déconnexion"
              onClick={() => void signOut()}
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <LogOut className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
