import ComingSoon from "@/components/ComingSoon";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
      <ComingSoon
        phase="Fase 4"
        title="Pengaturan situs, WhatsApp & sub-admin"
        description="Kelola nomor WhatsApp kontak, rekening tujuan pembayaran, tambah akun manual, dan atur sub-admin. Tabel site_settings, banks_admin, dan peran sub_admin sudah tersedia di database."
      />
    </div>
  );
}
