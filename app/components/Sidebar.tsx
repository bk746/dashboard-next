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
              ? "bg-[#4a4088] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
              : "text-white/85 hover:bg-white/12 hover:text-white"
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
        className="pointer-events-auto absolute left-4 top-5 flex h-[calc(100vh-2.5rem)] w-[72px] flex-col items-center rounded-[2rem] bg-gradient-to-b from-[#6C5DD3] via-[#5E549E] to-[#5349A8] py-5 shadow-[0_12px_40px_-8px_rgba(108,93,211,0.55),0_4px_16px_rgba(0,0,0,0.08)]"
        aria-label="Navigation principale"
      >
        {/* Haut — raccourci / alertes */}
        <div className="flex flex-col items-center">
          <Link
            href="/dashboard"
            title="BK Copilot"
            aria-label="Accueil BK Copilot"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white transition-colors hover:bg-white/22"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>

        <div className="my-4 h-px w-8 bg-white/20" aria-hidden />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-2 [&::-webkit-scrollbar]:hidden">
          <ul className="flex flex-col items-center gap-1.5">
            {mainNav.map((item) => (
              <NavIconButton key={item.href} {...item} active={isNavActive(item.href, pathname)} />
            ))}
          </ul>
        </nav>

        <div className="my-3 h-px w-8 bg-white/20" aria-hidden />

        {/* Bas — paramètres & compte */}
        <div className="flex flex-col items-center gap-1.5">
          {!cloud ? (
            <Link
              href="/login"
              title="Connexion cloud"
              aria-label="Connexion cloud"
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-amber-200 transition-colors hover:bg-white/12"
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
                  ? "bg-[#4a4088] text-white"
                  : "text-white/85 hover:bg-white/12 hover:text-white"
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
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white/85 transition-colors hover:bg-white/12 hover:text-white"
            >
              <LogOut className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
