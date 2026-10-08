"use client";

import { useEffect, useRef, useState } from "react";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import type { Opportunity } from "@/types/titan";

const INTERVAL_MS = 4000;

type CardLabels = {
  payout: string;
  verification: string;
  level: string;
  remote: string;
  yes: string;
  no: string;
  trainingRequired: string;
  trainingOptional: string;
};

export function OpportunityRail({
  items,
  viewLabel,
  acceptLabel,
  labels,
  previousLabel,
  nextLabel,
}: {
  items: Opportunity[];
  viewLabel: string;
  acceptLabel: string;
  labels: CardLabels;
  previousLabel: string;
  nextLabel: string;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const node = railRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function jumpTo(index: number) {
    const node = railRef.current;
    if (!node || items.length === 0) return;
    const wrapped = ((index % items.length) + items.length) % items.length;
    const target = node.children.item(wrapped) as HTMLElement | null;
    if (!target) return;
    setActiveIndex(wrapped);
    const left =
      target.getBoundingClientRect().left - node.getBoundingClientRect().left + node.scrollLeft;
    node.scrollTo({ left, behavior: "smooth" });
  }

  useEffect(() => {
    if (items.length < 2 || paused || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % items.length;
        const node = railRef.current;
        const target = node?.children.item(next) as HTMLElement | null;
        if (node && target) {
          const left =
            target.getBoundingClientRect().left - node.getBoundingClientRect().left + node.scrollLeft;
          node.scrollTo({ left, behavior: "smooth" });
        }
        return next;
      });
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [inView, items.length, paused]);

  function pause() {
    setPaused(true);
  }

  function resume(event: { currentTarget: HTMLElement; relatedTarget: EventTarget | null }) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setPaused(false);
  }

  return (
    <div
      className="relative mt-5 md:mt-8"
      onMouseEnter={pause}
      onMouseLeave={() => setPaused(false)}
      onFocus={pause}
      onBlur={(event) => resume(event)}
    >
      <ul
        ref={railRef}
        className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 pr-4 md:gap-5 md:pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="w-[78%] min-w-[78%] snap-start sm:w-[68%] sm:min-w-[68%] md:w-[54%] md:min-w-[54%] lg:w-[46%] lg:min-w-[46%]"
          >
            <OpportunityCard
              item={item}
              viewLabel={viewLabel}
              acceptLabel={acceptLabel}
              labels={labels}
            />
          </li>
        ))}
      </ul>
      {items.length > 1 ? (
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => jumpTo(activeIndex - 1)}
            className="inline-flex min-h-9 items-center border border-ink bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-white"
            aria-label={previousLabel}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => jumpTo(activeIndex + 1)}
            className="inline-flex min-h-9 items-center border border-ink bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-white"
            aria-label={nextLabel}
          >
            <ChevronRight />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
      <path d="M7.5 2 4 6l3.5 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
      <path d="M4.5 2 8 6l-3.5 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
