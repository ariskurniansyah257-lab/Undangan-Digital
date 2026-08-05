import ComingSoon from "@/components/ComingSoon";

export default function AdminThemesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tema / Template</h1>
      <ComingSoon
        phase="Fase 4"
        title="Kelola tema per paket"
        description="Tambah/hapus tema, unggah preview, dan atur konfigurasi tampilan per paket (Basic/Premium/Luxury/Motion)."
      />
    </div>
  );
}
