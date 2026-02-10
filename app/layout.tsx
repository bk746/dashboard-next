import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MobileNav from "./components/MobileNav";
import Sidebar from "./components/Sidebar";
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
};

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
          <main className="flex-1 w-full md:ml-[280px] bg-black min-h-screen pt-14 md:pt-0 relative z-0 overflow-auto">
            <div className="h-auto mb-5 px-4 md:px-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
