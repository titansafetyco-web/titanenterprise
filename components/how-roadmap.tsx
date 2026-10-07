"use client";

import { useState } from "react";

type RoadmapItem = {
  id: string;
  title: string;
  text: string;
  points: readonly string[];
};

export function HowRoadmap({
  items,
  detailLabel,
  nextStepLabel,
  learnMoreLabel,
  continueLabel,
  progressLabel,
}: {
  items: RoadmapItem[];
  detailLabel: string;
  nextStepLabel: string;
  learnMoreLabel: string;
  continueLabel: string;
  progressLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex];
  const next = items[(activeIndex + 1) % items.length];

  return (
    <>
      <ol className="relative mt-5 grid gap-2 md:mt-8 md:gap-4 md:grid-cols-5">
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-4 top-0 w-px bg-line md:bottom-auto md:left-0 md:right-0 md:top-5 md:h-px md:w-auto"
        />
        {items.map((item, index) => {
          const selected = index === activeIndex;
          return (
            <li key={item.id} className="relative">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group relative h-full w-full border p-3 text-left transition md:p-5 md:pt-10 ${
                  selected
                    ? "border-foreground bg-white shadow-sm"
                    : "border-line bg-canvas hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white"
                }`}
                aria-pressed={selected}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-4 top-5 z-10 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-white md:left-1/2 md:top-0 md:-translate-x-1/2 md:-translate-y-1/2 ${
                    selected ? "bg-accent" : "bg-line"
                  }`}
                />
                <div className="pl-4 md:pl-0 md:text-center">
                  <p className={`font-display text-[11px] font-semibold uppercase tracking-[0.12em] md:text-xs ${selected ? "text-accent" : "text-muted"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1.5 font-display text-xs font-semibold uppercase tracking-[0.1em] md:mt-2 md:text-sm md:tracking-[0.12em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 hidden text-xs uppercase tracking-[0.12em] text-muted md:mt-3 md:block">
                    {learnMoreLabel}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 border border-line md:mt-5">
        <div className="grid md:grid-cols-12 md:items-stretch">
          <div className="relative min-h-[28rem] border-b border-line bg-white md:col-span-7 md:min-h-0 md:border-b-0 md:border-r">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-accent" />
            <div className="flex h-full flex-col px-5 py-5 pl-7 md:px-8 md:py-7 md:pl-10">
              <div className="flex items-center justify-between gap-4">
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-accent md:text-xs">
                  {detailLabel}
                </p>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted md:text-xs">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </p>
              </div>
              <p className="mt-5 font-display text-6xl font-bold leading-none text-ink/10 md:text-7xl">
                {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
                {active.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">{active.text}</p>
              <ul className="mt-5 flex flex-col gap-2">
                {active.points.map((point) => (
                  <li key={point} className="flex items-center gap-3 border border-line bg-canvas px-4 py-3">
                    <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-accent" />
                    <span className="text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIndex((activeIndex + 1) % items.length)}
                  className="inline-flex min-h-11 items-center bg-accent px-5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink"
                >
                  {continueLabel}: {next.title}
                </button>
              </div>
            </div>
          </div>

          <aside className="flex h-full flex-col bg-ink px-5 py-5 text-white md:col-span-5 md:px-6 md:py-7">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-accent md:text-xs">
              {progressLabel}
            </p>
            <ol className="mt-5 flex flex-1 flex-col justify-between gap-2">
              {items.map((item, index) => {
                const selected = index === activeIndex;
                const done = index < activeIndex;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                        selected ? "bg-accent text-ink" : "bg-white/5 hover:bg-white/10"
                      }`}
                      aria-current={selected ? "step" : undefined}
                    >
                      <span
                        className={`font-display text-sm font-bold ${
                          selected ? "text-ink" : done ? "text-accent" : "text-white/40"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-display text-sm font-semibold uppercase tracking-[0.1em]">
                        {item.title}
                      </span>
                    </button>
                    <div className="mt-1 h-1 bg-white/10">
                      <div className={`h-full ${index <= activeIndex ? "w-full bg-accent" : "w-0"}`} />
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 border-t border-white/15 pt-4">
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                {nextStepLabel}
              </p>
              <p className="mt-1 font-display text-lg font-bold uppercase tracking-wide">{next.title}</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
