import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RootProviders from "@/components/RootProviders";
import { ThemeProvider } from "./context/ThemeContext";
import "./globals.css";

/** Icônes servies depuis /public/icons (même source que manifest PWA). Mettre à jour depuis src/images/favicondashboard.png si besoin. */
const appIcon192 = "/icons/icon-192.png";
const appIcon512 = "/icons/icon-512.png";

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
    icon: [
      { url: appIcon192, sizes: "192x192", type: "image/png" },
      { url: appIcon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: appIcon192, sizes: "192x192", type: "image/png" }],
    shortcut: appIcon192,
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F5F7",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="bg-[#F5F5F7]" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F5F5F7] text-zinc-900`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');if(t!=='light')localStorage.setItem('theme','light');}}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <RootProviders>{children}</RootProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
