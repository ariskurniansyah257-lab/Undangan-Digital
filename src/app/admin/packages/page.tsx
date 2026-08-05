import ComingSoon from "@/components/ComingSoon";

export default function AdminPackagesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paket & Komparasi</h1>
      <ComingSoon
        phase="Fase 4"
        title="Editor paket & tabel komparasi"
        description="Tambah/edit paket, harga, batas fitur, dan baris komparasi (editable). Data paket sudah live dari database dan tampil di landing page."
      />
    </div>
  );
}
