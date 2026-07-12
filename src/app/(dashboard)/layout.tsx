"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Bell,
  Search,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/search", label: "Search", icon: Search },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      <aside className="hidden lg:flex w-60 flex-col border-r border-[#EADFCF] bg-[#FFFDF9] sticky top-0 h-screen">
        <div className="h-18 px-5 flex items-center border-b border-[#EADFCF]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4B1218] flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-lg shadow-sm">
              C
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-[#1E1C1B]">
              Clear<span className="text-[#8B2635]">Audit</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#4B1218] text-[#FAF7F2] shadow-sm"
                    : "text-[#5C5651] hover:text-[#4B1218] hover:bg-[#FAF7F2]"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#EADFCF] space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#FAF7F2]">
            <div className="h-8 w-8 rounded-full bg-[#4B1218] flex items-center justify-center text-[#FAF7F2] text-xs font-bold shrink-0">
              U
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1E1C1B] truncate">
                User
              </p>
              <p className="text-[10px] text-[#A69C90] truncate">
                user@example.com
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded-lg text-[#A69C90] hover:text-[#8B2635] hover:bg-[#EADFCF] transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
          <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#A69C90]">
            July 10, 2026
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden border-b border-[#EADFCF] bg-[#FAF7F2] sticky top-0 z-50 h-16 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#4B1218] flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-sm">
              C
            </div>
            <span className="font-serif text-base font-bold text-[#1E1C1B]">
              Clear<span className="text-[#8B2635]">Audit</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.slice(0, 4).map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#4B1218] text-[#FAF7F2]"
                      : "text-[#5C5651] hover:text-[#4B1218] hover:bg-[#F4EBE1]/50"
                  }`}
                >
                  <item.icon size={18} />
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
