"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { offerings } from "@/lib/site";

export function Offerings() {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const item = open === null ? null : offerings[open];

  useEffect(() => {
    if (open === null) return;
    const previous = document.activeElement;
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }

    document.addEventListener("keydown", onKey);
    const earlierOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = earlierOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open]);

  return (
    <section id="work" className="bg-canvas">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h2 className="font-display text-4xl font-bold uppercase tracking-wide">
          Work
          <span className="mt-3 block h-1 w-12 bg-accent" aria-hidden="true" />
        </h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {offerings.map((offering, index) => (
            <li key={offering.title}>
              <button
                type="button"
                onClick={() => setOpen(index)}
                className="flex w-full flex-col overflow-hidden border border-line bg-white text-left transition-shadow hover:shadow-[0_12px_30px_rgba(16,24,32,0.08)]"
              >
                <span className="relative block h-44 w-full">
                  <Image
                    src={offering.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 34rem, 100vw"
                    className="object-cover"
                  />
                </span>
                <span className="block h-1 bg-accent" aria-hidden="true" />
                <span className="flex flex-col p-6 md:p-8">
                <span className="font-display text-sm font-semibold tracking-[0.16em] text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold uppercase tracking-wide">
                  {offering.title}
                </h3>
                <p className="mt-3 max-w-sm leading-relaxed text-muted">
                  {offering.text}
                </p>
                <span className="mt-6 font-display text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                  Details
                </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      {item ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6"
          onClick={() => setOpen(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[calc(100svh-3rem)] w-full max-w-lg overflow-y-auto border border-line bg-white shadow-[0_24px_60px_rgba(16,24,32,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-52 w-full">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="32rem"
                className="object-cover"
              />
            </div>
            <div className="h-1 bg-accent" aria-hidden="true" />
            <div className="p-6 md:p-8">
            <p className="font-display text-sm font-semibold tracking-[0.16em] text-accent">
              {String(open! + 1).padStart(2, "0")}
            </p>
            <h3
              id={titleId}
              className="mt-3 font-display text-3xl font-bold uppercase tracking-wide"
            >
              {item.title}
            </h3>
            <p className="mt-4 text-lg leading-relaxed">{item.text}</p>
            <p className="mt-4 leading-relaxed text-muted">{item.detail}</p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(null)}
              className="mt-8 bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400]"
            >
              Close
            </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
