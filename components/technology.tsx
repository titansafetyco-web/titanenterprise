import type { ReactNode } from "react";
import { tools } from "@/lib/site";

const marks = [BrowserMark, LayoutMark, FormMark, ChartMark, NodesMark];

export function Technology() {
  return (
    <section id="technology" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h2 className="font-display text-4xl font-bold uppercase tracking-wide">
          <span className="flex items-center gap-4">
            <TechIcon />
            Technology
          </span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">
          We build the pages and tools that support a campaign, organize
          inquiries, and track results, including insurance affiliate
          inquiries. Media connects the message to the audience. Software
          connects the inquiry to the next step.
        </p>

        <div className="mt-12 overflow-hidden border border-line bg-ink text-white">
          <div
            className="bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"
          >
            <div className="grid md:grid-cols-2">
              <Path
                label="Media"
                from="Message"
                to="Audience"
                note="Connects the message to the audience."
              />
              <Path
                label="Software"
                from="Inquiry"
                to="Next step"
                note="Connects the inquiry to the next step."
                edge
              />
            </div>
          </div>

          <ol className="grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-5">
            {tools.map((tool, index) => {
              const Mark = marks[index];
              return (
                <li
                  key={tool}
                  className="border-b border-white/15 px-6 py-7 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  {Mark ? <Mark /> : null}
                  <p className="mt-5 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                    {tool}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Path({
  label,
  from,
  to,
  note,
  edge = false,
}: {
  label: string;
  from: string;
  to: string;
  note: string;
  edge?: boolean;
}) {
  return (
    <div
      className={`px-6 py-10 md:px-10 ${edge ? "border-t border-white/15 md:border-l md:border-t-0" : ""}`}
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
        {label}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Node>{from}</Node>
        <span className="relative h-px min-w-8 flex-1 bg-accent" aria-hidden="true">
          <span className="absolute -right-px top-1/2 -translate-y-1/2 border-y-[5px] border-l-[8px] border-y-transparent border-l-accent" />
        </span>
        <Node>{to}</Node>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-white/70">{note}</p>
    </div>
  );
}

function Node({ children }: { children: ReactNode }) {
  return (
    <span className="border border-white/25 bg-ink px-3 py-2 font-display text-sm font-semibold uppercase tracking-[0.12em]">
      {children}
    </span>
  );
}

function TechIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-10 w-10 text-accent" aria-hidden="true">
      <rect
        x="9"
        y="9"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect x="13" y="13" width="6" height="6" fill="currentColor" />
      <path
        d="M13 4v5M19 4v5M13 23v5M19 23v5M4 13h5M4 19h5M23 13h5M23 19h5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function BrowserMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-accent" aria-hidden="true">
      <rect x="3" y="6" width="26" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h26" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="9" r="1" fill="currentColor" />
      <circle cx="11" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}

function LayoutMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-accent" aria-hidden="true">
      <rect x="4" y="4" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12h24M14 12v16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FormMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-accent" aria-hidden="true">
      <rect x="7" y="3" width="18" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 10h10M11 16h10M11 22h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChartMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-accent" aria-hidden="true">
      <path d="M4 26h24" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 26V16M14 26V10M20 26V18M26 26V8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function NodesMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-accent" aria-hidden="true">
      <circle cx="8" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 14.5 21 9.2M11 17.5 21 22.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
