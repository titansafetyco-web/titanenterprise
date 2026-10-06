"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { WorkDetails } from "@/components/work-details";

type OfferingItem = {
  id: string;
  title: string;
  image: string;
  text: string;
  detail: string;
  points: readonly string[];
};

export function WorkCarousel({
  items,
  learnMore,
  showLess,
  previousLabel,
  nextLabel,
  tabsLabel,
}: {
  items: readonly OfferingItem[];
  learnMore: string;
  showLess: string;
  previousLabel: string;
  nextLabel: string;
  tabsLabel: string;
}) {
  const railRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const openItem = openCardId ? items.find((item) => item.id === openCardId) ?? null : null;

  function slide(direction: "prev" | "next") {
    const node = railRef.current;
    if (!node) return;
    const amount = Math.max(280, Math.round(node.clientWidth * 0.82));
    const nextIndex = Math.max(
      0,
      Math.min(items.length - 1, activeIndex + (direction === "next" ? 1 : -1)),
    );
    setActiveIndex(nextIndex);
    node.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  }

  function jumpTo(index: number) {
    const node = railRef.current;
    if (!node) return;
    const target = node.children.item(index) as HTMLElement | null;
    if (!target) return;
    setActiveIndex(index);
    target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  function toggleCard(id: string) {
    setOpenCardId((current) => (current === id ? null : id));
  }

  return (
    <div className="relative z-20 mt-8 md:mt-12">
      <ul
        aria-label={tabsLabel}
        className="grid border border-line bg-white sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
      >
        {items.map((item, index) => (
          <li key={`tab-${item.id}`} className={index > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}>
            <button
              type="button"
              onClick={() => jumpTo(index)}
              className={`block w-full px-4 py-4 text-left font-display text-xs font-semibold uppercase tracking-wider transition-colors ${
                index === activeIndex
                  ? "bg-accent text-ink"
                  : "hover:bg-accent hover:text-ink"
              }`}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>

      <ol ref={railRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:gap-5">
        {items.map((offering) => (
          <li
            id={offering.id}
            key={offering.id}
            className="group relative flex w-[85%] min-w-[85%] snap-start flex-col overflow-hidden border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-[70%] sm:min-w-[70%] md:w-[48%] md:min-w-[48%] lg:w-[38%] lg:min-w-[38%]"
          >
            <div className="relative h-52">
              <Image
                src={offering.image}
                alt=""
                fill
                sizes="(min-width: 1280px) 22rem, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-expanded={openCardId === offering.id}
              onClick={() => toggleCard(offering.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleCard(offering.id);
                }
              }}
              className="relative flex min-h-56 flex-1 cursor-pointer flex-col border-t-4 border-accent px-5 py-6 md:px-6 md:py-7"
            >
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide">{offering.title}</h3>
              <p className="mt-3 text-base leading-relaxed">{offering.text}</p>
              <p className="mt-6 inline-flex min-h-11 items-center font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {openCardId === offering.id ? showLess : learnMore}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => slide("prev")}
          className="inline-flex min-h-9 items-center border border-ink bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-white"
          aria-label={previousLabel}
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          onClick={() => slide("next")}
          className="inline-flex min-h-9 items-center border border-ink bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-white"
          aria-label={nextLabel}
        >
          <ChevronRight />
        </button>
      </div>
      {openItem ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 border-t-4 border-accent bg-white px-5 py-6 shadow-[0_18px_34px_rgba(16,24,32,0.24)] md:px-6 md:py-7">
          <button
            type="button"
            onClick={() => setOpenCardId(null)}
            className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent"
          >
            {showLess}
          </button>
          <p className="mt-3 font-display text-2xl font-bold uppercase tracking-wide">{openItem.title}</p>
          <WorkDetails detail={openItem.detail} points={openItem.points} />
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
