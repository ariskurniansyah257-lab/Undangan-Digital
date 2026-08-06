"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";
import type { NavItem } from "./SidebarNav";

/** Header + navigasi admin khusus mobile (sidebar tersembunyi di HP). */
export default function AdminMobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <Link href="/admin" className="text-base font-bold text-gray-900">
          Admin Panel
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xs text-gray-500">
            ↩️ Dashboard
          </Link>
          <SignOutButton className="text-xs font-medium text-red-500" />
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
