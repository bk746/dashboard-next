"use client";

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

  if (isPublicAuth) {
    return (
      <AuthProvider>
        <DataSyncProvider>
          <LaunchSplash>
            <MotionProvider mode="window">
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
            <div
              className={`flex min-h-screen ${isLightPage ? "bg-[#F5F5F7]" : "bg-[#0a0a0c]"}`}
            >
              <MobileNav />
              <Sidebar />
              <main
                id="app-scroll"
                className={`relative z-0 w-full flex-1 pt-20 md:ml-[104px] md:pt-0 ${
                  isLightPage ? "bg-[#F5F5F7]" : "bg-[#0a0a0c]"
                }`}
              >
                <MotionProvider mode="window">
                  <div data-page-shell>
                    <CacheBuster>{children}</CacheBuster>
                  </div>
                </MotionProvider>
              </main>
            </div>
          </RequireAuth>
        </EntryGate>
      </DataSyncProvider>
    </AuthProvider>
  );
}
