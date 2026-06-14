"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { DataSyncProvider } from "@/context/DataSyncContext";
import CacheBuster from "@/app/components/CacheBuster";
import MobileNav from "@/app/components/MobileNav";
import RequireAuth from "@/components/RequireAuth";
import EntryGate from "@/components/EntryGate";
import LaunchSplash from "@/components/LaunchSplash";
import Sidebar from "@/app/components/Sidebar";
import MotionProvider from "@/components/MotionProvider";

export default function RootProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicAuth = pathname === "/login" || pathname === "/auth/callback";
  const isLightPage =
    pathname === "/dashboard" ||
    pathname === "/clients" ||
    pathname === "/prospection" ||
    pathname === "/finance" ||
    pathname === "/estimation" ||
    pathname.startsWith("/estimation/") ||
    pathname === "/deals-projets" ||
    pathname === "/objectifs" ||
    pathname === "/parametres";

  /** Fond racine = même teinte que la page (évite la bande noire au overscroll iOS). */
  useEffect(() => {
    const bg = isPublicAuth || !isLightPage ? "#0a0a0c" : "#F5F5F7";
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
  }, [isPublicAuth, isLightPage]);

  if (isPublicAuth) {
    return (
      <AuthProvider>
        <DataSyncProvider>
          <LaunchSplash>
            <MotionProvider>
              <div data-page-shell className="min-h-screen bg-[#0a0a0c]">
                {children}
              </div>
            </MotionProvider>
          </LaunchSplash>
        </DataSyncProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <DataSyncProvider>
        <EntryGate>
          <RequireAuth>
            <>
              <MobileNav />
              <Sidebar />
              <main
                className={`relative z-0 box-border min-w-0 max-w-full w-full overflow-x-hidden pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(6rem,calc(5rem+env(safe-area-inset-bottom)))] md:pl-[104px] md:pb-8 md:pt-0 ${
                  isLightPage ? "bg-[#F5F5F7]" : "bg-[#0a0a0c]"
                }`}
              >
                <MotionProvider>
                  <div data-page-shell className="min-w-0 max-w-full">
                    <CacheBuster>{children}</CacheBuster>
                  </div>
                </MotionProvider>
              </main>
            </>
          </RequireAuth>
        </EntryGate>
      </DataSyncProvider>
    </AuthProvider>
  );
}
