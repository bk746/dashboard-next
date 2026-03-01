import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MobileNav from "./components/MobileNav";
import Sidebar from "./components/Sidebar";
import CacheBuster from "./components/CacheBuster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinPilot",
  description: "FinPilot Dashboard",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinPilot",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
};

// Éviter la mise en cache statique des pages
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <div className="flex min-h-screen bg-black">
          {/* Mobile Navigation */}
          <MobileNav />

          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 w-full md:ml-[280px] min-h-screen pt-20 md:pt-0 relative z-0 overflow-auto bg-[#f6f6f6] md:bg-[#f8f8f7]">
            <div className="h-auto md:min-h-screen">
              <CacheBuster>{children}</CacheBuster>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
