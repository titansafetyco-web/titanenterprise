export function QualityScore({
  label,
  empty,
}: {
  label: string;
  empty: string;
}) {
  return (
    <section className="border-t-4 border-line bg-white p-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-3 text-sm text-muted">{empty}</p>
    </section>
  );
}
