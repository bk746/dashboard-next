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
  ChevronRight,
  Calculator,
  ClipboardList,
  LogIn,
  LogOut,
  SquareStack,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const sf =
  "font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Segoe_UI',sans-serif]";

const bottomTabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/prospection", label: "Prospect", icon: ClipboardList },
  { href: "/finance", label: "Finance", icon: Wallet },
];

const menuItems: {
  href: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  tint: string;
  iconBg: string;
}[] = [
  {
    href: "/estimation",
    label: "Estimation",
    subtitle: "Devis & tarifs",
    icon: Calculator,
    tint: "text-violet-600",
    iconBg: "bg-violet-500/12",
  },
  {
    href: "/deals-projets",
    label: "Deals / Projets",
    subtitle: "Pipeline commercial",
    icon: Briefcase,
    tint: "text-[#007AFF]",
    iconBg: "bg-[#007AFF]/12",
  },
  {
    href: "/objectifs",
    label: "Objectifs",
    subtitle: "Cibles & progression",
    icon: Target,
    tint: "text-emerald-600",
    iconBg: "bg-emerald-500/12",
  },
  {
    href: "/parametres",
    label: "Paramètres",
    subtitle: "Compte & préférences",
    icon: Settings,
    tint: "text-zinc-600",
    iconBg: "bg-zinc-500/10",
  },
];

const menuHrefs = new Set(menuItems.map((i) => i.href));

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMenuSectionActive(pathname: string): boolean {
  if (pathname === "/parametres" || pathname.startsWith("/parametres/")) return true;
  return menuHrefs.has(pathname) || pathname.startsWith("/estimation/");
}

function TabItem({
  label,
  icon: Icon,
  active,
  href,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <span
      className={`relative flex flex-col items-center justify-center gap-[5px] rounded-[18px] px-2.5 py-2 transition-all duration-300 ease-out ${
        active
          ? "bg-[#007AFF]/10 shadow-[inset_0_0_0_1px_rgba(0,122,255,0.12)]"
          : "bg-transparent"
      }`}
    >
      <Icon
        className={`h-[22px] w-[22px] transition-colors duration-300 ${active ? "text-[#007AFF]" : "text-zinc-400"}`}
        strokeWidth={active ? 2.25 : 1.65}
        aria-hidden
      />
      <span
        className={`max-w-[4.5rem] truncate text-[10px] leading-none tracking-[-0.02em] transition-colors duration-300 ${
          active ? "font-semibold text-[#007AFF]" : "font-medium text-zinc-400"
        }`}
      >
        {label}
      </span>
    </span>
  );

  const wrapperClass = `${sf} flex min-w-0 flex-1 items-center justify-center active:scale-[0.96] transition-transform duration-200`;

  if (href) {
    return (
      <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className={wrapperClass}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={wrapperClass}
    >
      {inner}
    </button>
  );
}

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const cloud = isSupabaseConfigured();
  const menuActive = isMenuSectionActive(pathname);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Dock flottant premium — mobile uniquement */}
      <div
        className={`${sf} md:hidden fixed inset-x-0 bottom-0 z-50 pointer-events-none mobile-nav-root`}
        aria-hidden={false}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7]/90 to-transparent" />

        <nav
          className="pointer-events-auto relative mx-auto max-w-[440px] px-4 pb-[max(0.65rem,env(safe-area-inset-bottom))]"
          aria-label="Navigation principale"
        >
          <div
            className="flex items-center justify-between gap-0.5 rounded-[26px] border border-white/70 bg-white/72 p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-6px_rgba(0,0,0,0.10),0_24px_48px_-12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-3xl backdrop-saturate-150"
            style={{ WebkitBackdropFilter: "blur(40px) saturate(180%)" }}
          >
            {bottomTabs.map((tab) => (
              <TabItem key={tab.href} {...tab} active={isNavActive(tab.href, pathname)} href={tab.href} />
            ))}
            <TabItem
              label="Plus"
              icon={SquareStack}
              active={menuActive || menuOpen}
              onClick={() => setMenuOpen(true)}
            />
          </div>
        </nav>
      </div>

      {/* Sheet premium */}
      {menuOpen ? (
        <>
          <div
            className="md:hidden fixed inset-0 z-[60] bg-zinc-950/20 backdrop-blur-[3px]"
            onClick={closeMenu}
            aria-hidden
          />
          <div
            className={`${sf} md:hidden fixed inset-x-0 bottom-0 z-[70] flex max-h-[min(88dvh,580px)] flex-col overflow-hidden rounded-t-[22px] bg-[#F2F2F7] shadow-[0_-24px_64px_-16px_rgba(0,0,0,0.18)]`}
            role="dialog"
            aria-modal="true"
            aria-label="Plus"
          >
            <div className="flex shrink-0 flex-col items-center px-5 pb-4 pt-3">
              <div className="mb-4 h-[5px] w-10 rounded-full bg-zinc-300/80" aria-hidden />
              <div className="flex w-full items-end justify-between">
                <div>
                  <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-zinc-400">Navigation</p>
                  <h2 className="mt-0.5 text-[28px] font-bold tracking-tight text-zinc-900">Plus</h2>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="rounded-full bg-white px-4 py-2 text-[15px] font-semibold text-[#007AFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] active:scale-95 transition-transform"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="space-y-2.5">
                {menuItems.map(({ href, label, subtitle, icon: Icon, tint, iconBg }) => {
                  const active = isNavActive(href, pathname);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3.5 rounded-2xl bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] transition-transform active:scale-[0.98] ${
                        active ? "ring-[#007AFF]/25" : ""
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${iconBg}`}
                      >
                        <Icon className={`h-[22px] w-[22px] ${tint}`} strokeWidth={1.75} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[16px] font-semibold tracking-tight ${active ? "text-[#007AFF]" : "text-zinc-900"}`}>
                          {label}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-zinc-500">{subtitle}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} aria-hidden />
                    </Link>
                  );
                })}
              </div>

              {!cloud ? (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="mt-4 flex items-center gap-3.5 rounded-2xl bg-amber-50 p-3.5 ring-1 ring-amber-200/60 active:scale-[0.98] transition-transform"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-amber-500/15">
                    <LogIn className="h-[22px] w-[22px] text-amber-700" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="flex-1 text-[16px] font-semibold text-amber-900">Connexion cloud</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={2} aria-hidden />
                </Link>
              ) : null}

              {cloud && user ? (
                <div className="mt-6">
                  {user.email ? (
                    <p className="mb-2.5 px-1 text-[12px] font-medium text-zinc-400">{user.email}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      void signOut();
                    }}
                    className="flex w-full items-center gap-3.5 rounded-2xl bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] active:scale-[0.98] transition-transform"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-red-500/10">
                      <LogOut className="h-[22px] w-[22px] text-[#FF3B30]" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="text-[16px] font-semibold text-[#FF3B30]">Déconnexion</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
