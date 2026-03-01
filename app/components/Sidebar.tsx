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
    <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:w-[280px] md:h-screen md:flex-col z-10
      bg-white border-r border-gray-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.06)]">
      {/* Brand */}
      <div className="p-5 md:p-6 border-b border-gray-100">
        <h1 className="text-lg font-semibold tracking-tight text-gray-800">
          <span className="text-[#ED8600] font-bold">BK</span>{" "}
          <span className="text-gray-500 font-medium">Copilot</span>
        </h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 md:p-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center pl-3 pr-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-[3px] ${
                isActive
                  ? "bg-[#ED8600]/10 text-[#ED8600] border-[#ED8600]"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Paramètres */}
      <div className="p-3 md:p-4 border-t border-gray-100">
        <Link
          href="/parametres"
          className={`flex items-center pl-3 pr-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-[3px] ${
            pathname === "/parametres"
              ? "bg-[#ED8600]/10 text-[#ED8600] border-[#ED8600]"
              : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
        >
          Paramètres
        </Link>
      </div>
    </aside>
  );
}
