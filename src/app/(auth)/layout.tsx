import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 text-center">
          <span className="text-2xl font-bold text-brand-600">Undangan</span>
          <span className="text-2xl font-light text-gray-800">Digital</span>
        </Link>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  );
}
