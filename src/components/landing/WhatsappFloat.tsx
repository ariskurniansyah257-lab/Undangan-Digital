export default function WhatsappFloat({ number }: { number: string }) {
  const clean = number.replace(/[^0-9]/g, "");
  if (!clean) return null;
  return (
    <a
      href={`https://wa.me/${clean}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
      aria-label="Hubungi via WhatsApp"
    >
      <span className="text-lg">💬</span>
      <span className="hidden sm:inline">Chat Admin</span>
    </a>
  );
}
