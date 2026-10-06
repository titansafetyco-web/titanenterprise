"use client";

import { useEffect, useState } from "react";

type StandardItem = {
  title: string;
  text: string;
};

export function StandardsCarousel({ items }: { items: StandardItem[] }) {
  const visibleItems = items.slice(2);
  const [index, setIndex] = useState(0);
  const count = visibleItems.length;

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="mt-6 md:mt-10">
      <div className="relative overflow-hidden border border-white/20 bg-white/5">
        <ol
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {visibleItems.map((item, itemIndex) => (
            <li key={item.title} className="min-w-full px-4 py-5 md:px-8 md:py-8">
              <article className="border border-white/20 bg-white px-5 py-5 text-foreground md:px-7 md:py-7">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                  <div>
                    <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Titan Standard
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-wide md:text-2xl">
                      {item.title}
                    </h3>
                  </div>
                  <span className="inline-flex min-h-9 items-center justify-center border border-line bg-canvas px-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-accent">
                    {String(itemIndex + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-4 border border-line bg-canvas px-4 py-4">
                  <p className="text-sm leading-relaxed text-muted md:text-base">{item.text}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex min-h-8 items-center border border-line px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Policy
                  </span>
                  <span className="inline-flex min-h-8 items-center border border-line px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Operations
                  </span>
                  <span className="inline-flex min-h-8 items-center border border-line px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Compliance
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>

      {count > 1 ? (
        <div className="mt-4 flex justify-center gap-2">
          {visibleItems.map((item, dotIndex) => (
            <button
              key={`dot-${item.title}`}
              type="button"
              aria-label={`Go to standard ${dotIndex + 1}`}
              onClick={() => setIndex(dotIndex)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                dotIndex === index ? "bg-accent" : "bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
