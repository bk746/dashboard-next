import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MobileNav from "./components/MobileNav";
import Sidebar from "./components/Sidebar";
import CacheBuster from "./components/CacheBuster";
import { ThemeProvider } from "./context/ThemeContext";
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
    <html lang="en" className="bg-[#f6f6f6] dark:bg-black" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f6f6f6] dark:bg-black text-gray-900 dark:text-white`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <div className="flex min-h-screen bg-[#f6f6f6] dark:bg-black">
            {/* Mobile Navigation */}
            <MobileNav />

            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 w-full md:ml-[280px] min-h-screen pt-20 md:pt-0 relative z-0 overflow-auto bg-[#f6f6f6] md:bg-[#f8f8f7] dark:bg-black">
              <div className="h-auto md:min-h-screen">
                <CacheBuster>{children}</CacheBuster>
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
