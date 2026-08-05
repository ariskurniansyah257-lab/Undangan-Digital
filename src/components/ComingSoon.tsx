export default function ComingSoon({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        {phase}
      </span>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="max-w-md text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
