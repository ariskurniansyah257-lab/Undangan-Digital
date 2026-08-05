import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SidebarNav, { type NavItem } from "@/components/SidebarNav";
import SignOutButton from "@/components/SignOutButton";
import { ensureProfile } from "@/lib/profile";

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Ringkasan", icon: "🏠" },
  { href: "/dashboard/invitations", label: "Undangan Saya", icon: "💌" },
  { href: "/dashboard/orders", label: "Pesanan", icon: "🧾" },
  { href: "/dashboard/settings", label: "Akun", icon: "⚙️" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const p = await ensureProfile(supabase, user);
  const isAdmin = p?.role === "admin" || p?.role === "sub_admin";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white p-4 md:flex">
        <Link href="/" className="mb-6 px-3 pt-2">
          <span className="text-lg font-bold text-brand-600">Undangan</span>
          <span className="text-lg font-light text-gray-800">Digital</span>
        </Link>
        <SidebarNav items={NAV} />
        {isAdmin && (
          <Link
            href="/admin"
            className="mt-4 flex items-center gap-3 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <span>🛡️</span> Admin Panel
          </Link>
        )}
        <div className="mt-auto border-t border-gray-100 pt-4">
          <p className="px-3 text-sm font-medium text-gray-700">
            {p?.full_name || "Pengguna"}
          </p>
          <p className="mb-2 px-3 text-xs text-gray-400">{p?.email}</p>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <Link href="/" className="text-lg font-bold text-brand-600">
            Undangan<span className="font-light text-gray-800">Digital</span>
          </Link>
        </div>
        <div className="mx-auto max-w-5xl p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
