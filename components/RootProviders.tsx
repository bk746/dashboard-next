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

export default function RootProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicAuth = pathname === "/login" || pathname === "/auth/callback";

  if (isPublicAuth) {
    return (
      <AuthProvider>
        <DataSyncProvider>
          <LaunchSplash>
            <div className="min-h-screen bg-[#0a0a0c]">{children}</div>
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
            <div className="flex min-h-screen bg-[#0a0a0c]">
              <MobileNav />
              <Sidebar />
              <main className="flex-1 w-full md:ml-[280px] min-h-screen pt-20 md:pt-0 relative z-0 overflow-auto bg-[#0a0a0c]">
                <div className="h-auto md:min-h-screen">
                  <CacheBuster>{children}</CacheBuster>
                </div>
              </main>
            </div>
          </RequireAuth>
        </EntryGate>
      </DataSyncProvider>
    </AuthProvider>
  );
}
