"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/clients", label: "Clients" },
    { href: "/finance", label: "Finance" },
    { href: "/deals-projets", label: "Deals / Projets" },
    { href: "/objectifs", label: "Objectifs" },
  ];

  return (
    <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:w-[280px] md:h-screen bg-black border-r border-neutral-700 flex-col z-10">
      {/* Brand */}
      <div className="p-4 md:p-6 border-b border-neutral-700">
        <h1 className="text-xl font-bold text-white text-center">
          <span className="text-[#1A10AC] text-3xl">BK</span> Copilot
        </h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded cursor-pointer transition-all duration-300 ease-out text-left text-lg font-bold ${
                isActive
                  ? "bg-[#1A10AC] text-black scale-103"
                  : "text-gray-300 hover:bg-[#1A10AC] hover:text-black hover:scale-103"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
