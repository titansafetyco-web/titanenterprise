"use client";

import { useState } from "react";

type RoadmapItem = {
  id: string;
  title: string;
  text: string;
};

export function HowRoadmap({
  items,
  detailLabel,
  nextStepLabel,
  learnMoreLabel,
}: {
  items: RoadmapItem[];
  detailLabel: string;
  nextStepLabel: string;
  learnMoreLabel: string;
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

      <div className="mt-3 border border-line bg-canvas p-3 md:mt-5 md:p-6">
        <div className="grid gap-3 md:gap-5 md:grid-cols-[1.6fr_1fr] md:items-stretch">
          <div
            className="relative overflow-hidden border border-line bg-white p-4 md:p-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.86), rgba(255,255,255,0.9)), url('/work-software-dev.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-accent md:text-xs">
              {detailLabel}
            </p>
            <h3 className="mt-1.5 font-display text-lg font-bold uppercase tracking-[0.08em] md:mt-2 md:text-2xl">
              {active.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted md:mt-3 md:text-base">{active.text}</p>
          </div>

          <aside className="grid grid-cols-2 gap-2 md:grid-cols-1 md:gap-3">
            <div className="border border-line bg-white p-3 md:p-4">
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted md:text-xs">
                {nextStepLabel}
              </p>
              <p className="mt-1.5 font-display text-sm font-bold uppercase tracking-[0.08em] md:mt-2 md:text-lg">
                {next.title}
              </p>
            </div>
            <div className="border border-line bg-white p-3 md:p-4">
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted md:text-xs">
                Progress
              </p>
              <p className="mt-1.5 font-display text-sm font-bold tracking-[0.06em] md:mt-2 md:text-lg">
                {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
