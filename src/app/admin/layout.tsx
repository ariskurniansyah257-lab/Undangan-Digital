import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SidebarNav, { type NavItem } from "@/components/SidebarNav";
import SignOutButton from "@/components/SignOutButton";
import type { Profile } from "@/lib/types";

const NAV: NavItem[] = [
  { href: "/admin", label: "Ringkasan", icon: "📊" },
  { href: "/admin/clients", label: "Akun Client", icon: "👥" },
  { href: "/admin/payments", label: "Approval Bayar", icon: "💳" },
  { href: "/admin/packages", label: "Paket & Komparasi", icon: "📦" },
  { href: "/admin/themes", label: "Tema / Template", icon: "🎨" },
  { href: "/admin/products", label: "Produk", icon: "🛍️" },
  { href: "/admin/songs", label: "Lagu", icon: "🎵" },
  { href: "/admin/settings", label: "Pengaturan", icon: "⚙️" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const p = profile as Profile | null;
  if (!p || (p.role !== "admin" && p.role !== "sub_admin")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white p-4 md:flex">
        <div className="mb-6 px-3 pt-2">
          <span className="text-lg font-bold text-gray-900">Admin Panel</span>
          <p className="text-xs text-gray-400">
            {p.role === "admin" ? "Administrator" : "Sub-admin"}
          </p>
        </div>
        <SidebarNav items={NAV} />
        <Link
          href="/dashboard"
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <span>↩️</span> Ke Dashboard
        </Link>
        <div className="mt-auto border-t border-gray-100 pt-4">
          <p className="px-3 text-sm font-medium text-gray-700">
            {p.full_name || "Admin"}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
