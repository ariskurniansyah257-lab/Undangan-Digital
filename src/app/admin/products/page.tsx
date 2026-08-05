import ComingSoon from "@/components/ComingSoon";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
      <ComingSoon
        phase="Fase 4"
        title="Kelola produk"
        description="Tambah produk dengan gambar, nama, harga, dan template terkait untuk katalog & keranjang belanja."
      />
    </div>
  );
}
