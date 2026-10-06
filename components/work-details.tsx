export function WorkDetails({
  detail,
  points,
}: {
  detail: string;
  points: readonly string[];
}) {
  return (
    <div>
      <p className="mt-4 leading-relaxed text-muted">{detail}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {points.map((point) => (
          <li key={point} className="flex gap-3 text-sm leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
