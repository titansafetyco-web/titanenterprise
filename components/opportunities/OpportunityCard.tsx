import Link from "next/link";
import type { Opportunity } from "@/types/titan";

function categoryTone(category: string) {
  switch (category.toLowerCase()) {
    case "energy":
      return "border-[#0f766e]/30 bg-[#ccfbf1] text-[#0f766e]";
    case "safety":
      return "border-[#a16207]/30 bg-[#fef3c7] text-[#a16207]";
    case "media":
      return "border-[#1d4ed8]/30 bg-[#dbeafe] text-[#1d4ed8]";
    case "software":
      return "border-[#7c3aed]/30 bg-[#ede9fe] text-[#7c3aed]";
    case "insurance":
      return "border-[#b91c1c]/30 bg-[#fee2e2] text-[#b91c1c]";
    default:
      return "border-line bg-canvas text-accent";
  }
}

export function OpportunityCard({
  item,
  viewLabel,
  acceptLabel,
  labels,
}: {
  item: Opportunity;
  viewLabel: string;
  acceptLabel: string;
  labels: {
    payout: string;
    verification: string;
    level: string;
    remote: string;
    yes: string;
    no: string;
    trainingRequired: string;
    trainingOptional: string;
  };
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-line bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md md:p-6">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-accent/70"
      />
      <p
        className={`inline-flex w-fit border px-2 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.12em] ${categoryTone(item.category)}`}
      >
        {item.category}
      </p>
      <h3 className="mt-2 font-display text-base font-bold leading-snug md:mt-3 md:text-2xl">{item.title}</h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted md:mt-3 md:text-sm">{item.description}</p>

      <dl className="mt-3 grid gap-2 rounded-sm border border-line bg-canvas p-2.5 text-sm md:mt-6 md:gap-4 md:p-4">
        <div className="rounded-sm border border-accent/30 bg-[#fff7cc] px-2.5 py-2.5 md:px-3 md:py-3">
          <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
            {item.compensationLabel}
          </dt>
          <dd className="mt-0.5 font-display text-lg font-bold leading-tight text-foreground md:mt-1 md:text-2xl">{item.compensationAmount}</dd>
          <dd className="mt-0.5 text-xs font-medium text-[#7a5b00] md:mt-1 md:text-sm">{item.compensationType}</dd>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-3">
          <Fact label={labels.payout} value={item.payoutSchedule} />
          <Fact label={labels.verification} value={item.verificationTime} />
          <Fact label={labels.level} value={item.difficulty} />
          <Fact label={labels.remote} value={item.remote ? labels.yes : labels.no} />
        </div>
        <p className="rounded-sm border border-dashed border-line bg-white px-2.5 py-1.5 text-[11px] uppercase tracking-[0.11em] text-muted md:px-3 md:py-2 md:text-xs md:tracking-[0.12em]">
          {item.trainingRequired ? labels.trainingRequired : labels.trainingOptional}
        </p>
      </dl>

      <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-3 md:mt-6">
        <Link href={`/opportunities/${item.id}`} className="inline-flex min-h-9 w-full items-center justify-center rounded-sm bg-accent px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-[#e0b400] md:min-h-11 md:px-4 md:text-xs md:tracking-[0.14em]">
          {viewLabel}
        </Link>
        <Link href="/login?next=/jobs" className="inline-flex min-h-9 w-full items-center justify-center rounded-sm border border-ink px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-white md:min-h-11 md:px-4 md:text-xs md:tracking-[0.14em]">
          {acceptLabel}
        </Link>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-line bg-white px-2.5 py-2 md:px-3 md:py-2.5">
      <dt className="flex items-center gap-1.5 font-display text-[9px] font-semibold uppercase tracking-[0.11em] text-muted md:gap-2 md:text-[10px] md:tracking-[0.12em]">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        {label}
      </dt>
      <dd className="mt-0.5 pl-3 font-display text-xs font-semibold leading-snug tracking-[0.02em] text-foreground md:mt-1 md:pl-3.5 md:text-sm md:tracking-[0.03em]">
        {value}
      </dd>
    </div>
  );
}
