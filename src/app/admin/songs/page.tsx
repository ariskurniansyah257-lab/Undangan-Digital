import ComingSoon from "@/components/ComingSoon";

export default function AdminSongsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Lagu</h1>
      <ComingSoon
        phase="Fase 4"
        title="Kelola daftar lagu"
        description="Tambah/hapus lagu (judul, artis, URL) yang bisa dipilih client untuk latar undangan. Tabel & RLS sudah siap."
      />
    </div>
  );
}
