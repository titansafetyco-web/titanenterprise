export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <li className="border-t-4 border-accent bg-white p-6">
      <p className="font-display text-3xl font-bold tracking-tight md:text-4xl">{value}</p>
      <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </li>
  );
}
