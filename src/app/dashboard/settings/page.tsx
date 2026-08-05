import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import SignOutButton from "@/components/SignOutButton";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Akun</h1>
      <ProfileForm profile={data as Profile} />
      <ChangePasswordForm />

      <div className="card max-w-lg p-6">
        <h2 className="font-semibold text-gray-900">Keluar</h2>
        <p className="mb-3 mt-1 text-sm text-gray-500">
          Keluar dari akun ini di perangkat Anda.
        </p>
        <SignOutButton className="btn-outline w-fit border-red-200 text-red-600 hover:bg-red-50" />
      </div>
    </div>
  );
}
