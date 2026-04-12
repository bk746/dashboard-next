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
  ScanEye,
  ClipboardList,
  Globe,
  LogOut,
  LogIn,
  type LucideIcon,
} from "lucide-react";

type NavLeaf = { href: string; label: string; icon: LucideIcon };
type NavItem =
  | NavLeaf
  | { href: string; label: string; icon: LucideIcon; children: NavLeaf[] };

const menuItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/prospection", label: "Prospection", icon: ClipboardList },
  {
    href: "/finance",
    label: "Finance",
    icon: Wallet,
    children: [
      { href: "/estimation", label: "Estimation", icon: Calculator },
      { href: "/audit-visuel", label: "Audit visuel", icon: ScanEye },
    ],
  },
  { href: "/analyse-site", label: "Analyseur IA", icon: Globe },
  { href: "/deals-projets", label: "Deals / Projets", icon: Briefcase },
  { href: "/objectifs", label: "Objectifs", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const cloud = isSupabaseConfigured();

  return (
    <aside
      className="hidden md:flex md:fixed md:left-0 md:top-0 md:w-[280px] md:h-screen md:flex-col z-10
        bg-white dark:bg-[#0a0a0c]
        border-r border-zinc-200/90 dark:border-white/[0.06]
        shadow-[4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_32px_rgba(0,0,0,0.35)]"
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-zinc-100 dark:border-white/[0.06]">
        <h1 className="text-lg font-semibold tracking-tight leading-none">
          <span className="text-[#ED8600] dark:text-[#8fa9c9]">BK</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium"> Copilot</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Navigation principale">
        <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Menu
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            if ("children" in item && item.children?.length) {
              return (
                <li key={item.href} className="space-y-1">
                  <Link
                    href={item.href}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200
                      ${
                        pathname === item.href
                          ? "bg-[#ED8600]/10 text-[#c2410c] dark:bg-white/[0.06] dark:text-[#b8c9d9]"
                          : "text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors
                        ${
                          pathname === item.href
                            ? "border-[#ED8600]/25 bg-[#ED8600]/10 text-[#ED8600] dark:border-[#8fa9c9]/25 dark:bg-[#8fa9c9]/10 dark:text-[#8fa9c9]"
                            : "border-zinc-200/80 bg-zinc-50 text-zinc-500 group-hover:border-zinc-300 group-hover:text-zinc-700 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-500 dark:group-hover:border-white/[0.1] dark:group-hover:text-zinc-300"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                  <ul className="ml-2 pl-3 border-l border-zinc-200/80 dark:border-white/[0.08] space-y-0.5">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = pathname === child.href;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`
                              group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors duration-200
                              ${
                                childActive
                                  ? "bg-[#ED8600]/10 text-[#c2410c] dark:bg-white/[0.06] dark:text-[#b8c9d9]"
                                  : "text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                              }
                            `}
                          >
                            <span
                              className={`
                                flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors
                                ${
                                  childActive
                                    ? "border-[#ED8600]/25 bg-[#ED8600]/10 text-[#ED8600] dark:border-[#8fa9c9]/25 dark:bg-[#8fa9c9]/10 dark:text-[#8fa9c9]"
                                    : "border-zinc-200/80 bg-zinc-50 text-zinc-500 group-hover:border-zinc-300 dark:border-white/[0.06] dark:bg-white/[0.03]"
                                }
                              `}
                            >
                              <ChildIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                            </span>
                            <span className="truncate">{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            }
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? "bg-[#ED8600]/10 text-[#c2410c] dark:bg-white/[0.06] dark:text-[#b8c9d9]"
                        : "text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
                    }
                  `}
                >
                  <span
                    className={`
                      flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors
                      ${
                        isActive
                          ? "border-[#ED8600]/25 bg-[#ED8600]/10 text-[#ED8600] dark:border-[#8fa9c9]/25 dark:bg-[#8fa9c9]/10 dark:text-[#8fa9c9]"
                          : "border-zinc-200/80 bg-zinc-50 text-zinc-500 group-hover:border-zinc-300 group-hover:text-zinc-700 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-500 dark:group-hover:border-white/[0.1] dark:group-hover:text-zinc-300"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pied : compte + paramètres */}
      <div className="p-3 border-t border-zinc-100 dark:border-white/[0.06] mt-auto space-y-2">
        {!cloud ? (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5">
            <p className="text-[11px] font-medium leading-snug text-amber-800 dark:text-amber-200/95">
              Pas de sync cloud : variables Supabase absentes sur ce déploiement (Vercel → Environment
              Variables).
            </p>
            <Link
              href="/login"
              className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-900 underline-offset-2 hover:underline dark:text-amber-100"
            >
              <LogIn className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Connexion &amp; aide
            </Link>
          </div>
        ) : user ? (
          <>
            <p className="truncate px-3 text-[11px] text-zinc-500 dark:text-zinc-400" title={user.email ?? ""}>
              {user.email}
            </p>
            <button
              type="button"
              onClick={() => void signOut()}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-500 transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-zinc-50 text-zinc-500 transition-colors group-hover:border-zinc-300 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-500 dark:group-hover:border-white/[0.1] dark:group-hover:text-zinc-300">
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span>Déconnexion</span>
            </button>
          </>
        ) : null}
        <Link
          href="/parametres"
          className={`
            group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200
            ${
              pathname === "/parametres"
                ? "bg-[#ED8600]/10 text-[#c2410c] dark:bg-white/[0.06] dark:text-[#b8c9d9]"
                : "text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200"
            }
          `}
        >
          <span
            className={`
              flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors
              ${
                pathname === "/parametres"
                  ? "border-[#ED8600]/25 bg-[#ED8600]/10 text-[#ED8600] dark:border-[#8fa9c9]/25 dark:bg-[#8fa9c9]/10 dark:text-[#8fa9c9]"
                  : "border-zinc-200/80 bg-zinc-50 text-zinc-500 group-hover:border-zinc-300 group-hover:text-zinc-700 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-500 dark:group-hover:border-white/[0.1] dark:group-hover:text-zinc-300"
              }
            `}
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
          <span>Paramètres</span>
        </Link>
      </div>
    </aside>
  );
}
