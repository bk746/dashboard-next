"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/clients", label: "Clients" },
    { href: "/finance", label: "Finance" },
    { href: "/deals-projets", label: "Deals / Projets" },
    { href: "/objectifs", label: "Objectifs" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-black border-b border-neutral-700 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-white">
            <span className="text-[#1A10AC] text-xl">BK</span> Copilot
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <aside
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-black border-l border-neutral-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              <span className="text-[#1A10AC]">BK</span> Copilot
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-gray-300 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-[#1A10AC] text-white font-semibold"
                    : "hover:bg-neutral-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
