import Link from "next/link";
import { ReviewButtons } from "@/components/review-buttons";

export function ApprovalQueue({
  title,
  empty,
  requestLabel,
  rows,
}: {
  title: string;
  empty: string;
  requestLabel: string;
  rows: { id: string; name: string; detail: string; kind: "account" | "application" }[];
}) {
  return (
    <section className="mt-12 bg-white">
      <div className="border-b border-line px-6 py-5">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">{empty}</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={`${row.kind}-${row.id}`} className="border-b border-line px-6 py-5 last:border-0">
              <p className="font-display text-lg font-semibold uppercase tracking-wide">{row.name}</p>
              <p className="mt-1 text-sm text-muted">{row.detail}</p>
              <ReviewButtons id={row.id} kind={row.kind} status="pending" />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  disabled
                  title="TODO: request more information when an endpoint exists."
                  className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center border border-line px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted sm:w-auto"
                >
                  {requestLabel}
                </button>
                {row.kind === "account" ? (
                  <Link href="/dashboard/team" className="inline-flex min-h-11 w-full items-center justify-center font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent sm:w-auto">
                    {row.name}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
