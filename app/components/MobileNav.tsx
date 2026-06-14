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
  Ellipsis,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const sf =
  "font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Segoe_UI',sans-serif]";

const bottomTabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/prospection", label: "Prospect", icon: ClipboardList },
  { href: "/finance", label: "Finance", icon: Wallet },
];

const menuItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/estimation", label: "Estimation", icon: Calculator },
  { href: "/deals-projets", label: "Deals / Projets", icon: Briefcase },
  { href: "/objectifs", label: "Objectifs", icon: Target },
  { href: "/parametres", label: "Paramètres", icon: Settings },
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
  const className = `${sf} flex min-w-0 flex-1 flex-col items-center justify-center gap-[3px] pt-1.5 pb-0.5 transition-opacity active:opacity-60 ${
    active ? "text-[#007AFF]" : "text-zinc-400"
  }`;

  const content = (
    <>
      <Icon
        className="h-[25px] w-[25px]"
        strokeWidth={active ? 2.25 : 1.75}
        aria-hidden
      />
      <span className={`text-[10px] leading-none tracking-[-0.01em] ${active ? "font-semibold" : "font-medium"}`}>
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} aria-current={active ? "page" : undefined} className={className}>
      {content}
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
      {/* Tab bar iOS — pleine largeur, material blur */}
      <nav
        className={`${sf} md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.06] bg-[#F9F9F9]/80 backdrop-blur-2xl backdrop-saturate-150`}
        aria-label="Navigation principale"
        style={{ WebkitBackdropFilter: "blur(20px) saturate(180%)" }}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {bottomTabs.map((tab) => (
            <TabItem key={tab.href} {...tab} active={isNavActive(tab.href, pathname)} href={tab.href} />
          ))}
          <TabItem
            label="Plus"
            icon={Ellipsis}
            active={menuActive || menuOpen}
            onClick={() => setMenuOpen(true)}
          />
        </div>
      </nav>

      {/* Sheet iOS — sections groupées */}
      {menuOpen ? (
        <>
          <div
            className="md:hidden fixed inset-0 z-[60] bg-black/25 backdrop-blur-[1px]"
            onClick={closeMenu}
            aria-hidden
          />
          <div
            className={`${sf} md:hidden fixed inset-x-0 bottom-0 z-[70] flex max-h-[min(88dvh,560px)] flex-col overflow-hidden rounded-t-[14px] bg-[#F2F2F7]`}
            role="dialog"
            aria-modal="true"
            aria-label="Plus"
          >
            <div className="flex shrink-0 flex-col items-center border-b border-black/[0.06] bg-[#F2F2F7] px-5 pb-3 pt-2.5">
              <div className="mb-3 h-[5px] w-9 rounded-full bg-zinc-300/90" aria-hidden />
              <div className="flex w-full items-center justify-between">
                <h2 className="text-[22px] font-bold tracking-tight text-zinc-900">Plus</h2>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="text-[17px] font-normal text-[#007AFF] active:opacity-50"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="overflow-hidden rounded-[10px] bg-white">
                {menuItems.map(({ href, label, icon: Icon }, index) => {
                  const active = isNavActive(href, pathname);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 px-4 py-[11px] transition-colors active:bg-zinc-100 ${
                        index > 0 ? "border-t border-zinc-100" : ""
                      }`}
                    >
                      <Icon
                        className={`h-[22px] w-[22px] shrink-0 ${active ? "text-[#007AFF]" : "text-[#007AFF]"}`}
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span className={`flex-1 text-[17px] leading-snug ${active ? "font-medium text-[#007AFF]" : "text-zinc-900"}`}>
                        {label}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} aria-hidden />
                    </Link>
                  );
                })}
              </div>

              {!cloud ? (
                <div className="mt-8 overflow-hidden rounded-[10px] bg-white">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-[11px] active:bg-zinc-100"
                  >
                    <LogIn className="h-[22px] w-[22px] shrink-0 text-[#007AFF]" strokeWidth={1.75} aria-hidden />
                    <span className="flex-1 text-[17px] text-zinc-900">Connexion cloud</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} aria-hidden />
                  </Link>
                </div>
              ) : null}

              {cloud && user ? (
                <div className="mt-8">
                  {user.email ? (
                    <p className="mb-2 px-4 text-[13px] text-zinc-500">{user.email}</p>
                  ) : null}
                  <div className="overflow-hidden rounded-[10px] bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        void signOut();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-[11px] text-left active:bg-zinc-100"
                    >
                      <LogOut className="h-[22px] w-[22px] shrink-0 text-[#FF3B30]" strokeWidth={1.75} aria-hidden />
                      <span className="flex-1 text-[17px] text-[#FF3B30]">Déconnexion</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
