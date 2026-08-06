import { redirect } from "next/navigation";

// Menu "Ringkasan" dihapus — arahkan langsung ke "Undangan Saya".
export default function DashboardHome() {
  redirect("/dashboard/invitations");
}
