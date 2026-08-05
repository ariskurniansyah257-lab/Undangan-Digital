"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./SidebarNav";

/** Bottom-nav khusus tampilan mobile untuk dashboard (sidebar tersembunyi di HP). */
export default function DashboardMobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px] ${
                active ? "text-brand-600" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
