"use client";

import { useEffect, useId, useRef, useState } from "react";
import { steps } from "@/lib/site";

function DownArrow() {
  return (
    <svg viewBox="0 0 240 168" className="h-40 w-full" aria-hidden="true">
      <path fill="currentColor" d="M96 6h48v52h80L120 154 16 58h80V6z" />
    </svg>
  );
}

export function Approach() {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const step = open === null ? null : steps[open];

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
    <section id="approach" className="bg-canvas">
      <div className="mx-auto grid max-w-6xl md:grid-cols-12">
        <div className="flex flex-col border-l-8 border-accent bg-ink px-8 pt-14 pb-6 text-white md:col-span-5 md:px-10 md:pt-20 md:pb-8">
          <h2 className="font-display text-4xl font-bold uppercase tracking-wide">
            Approach
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/75">
            Through affiliate and referral programs, we identify prospective
            customers, introduce relevant offers, and guide interested
            applicants through signup and onboarding. That includes insurance
            affiliates for auto, home, renters, life, health, and business
            coverage.
          </p>
          <p className="mt-10 border-t border-white/15 pt-8 text-sm leading-relaxed text-white/70">
            We earn commissions for qualified leads, approved applications,
            enrollments, or completed sales, depending on each partner’s
            program. We learn the requirements, explain the offer clearly, and
            help customers finish the process accurately.
          </p>
          <a
            href="#standards"
            className="mt-10 flex w-full justify-center text-accent md:mt-auto md:pt-16"
          >
            <DownArrow />
            <span className="sr-only">Standards</span>
          </a>
        </div>
        <ol className="border-t border-line bg-white md:col-span-7 md:border-l md:border-t-0">
          {steps.map((item, index) => (
            <li
              key={item.title}
              className="border-b border-line last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setOpen(index)}
                className="grid w-full grid-cols-[3.5rem_1fr] gap-4 px-8 py-8 text-left md:px-12 md:py-10"
              >
                <span className="font-display text-sm font-bold tracking-[0.16em] text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-display text-2xl font-bold uppercase leading-tight tracking-wide">
                    {item.title}
                  </span>
                  <span className="mt-3 block max-w-md leading-relaxed text-muted">
                    {item.text}
                  </span>
                  <span className="mt-4 block font-display text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                    Details
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      {step ? (
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
            <div className="h-1 bg-accent" aria-hidden="true" />
            <div className="p-6 md:p-8">
              <p className="font-display text-sm font-semibold tracking-[0.16em] text-accent">
                {String(open! + 1).padStart(2, "0")}
              </p>
              <h3
                id={titleId}
                className="mt-3 font-display text-3xl font-bold uppercase tracking-wide"
              >
                {step.title}
              </h3>
              <p className="mt-4 text-lg leading-relaxed">{step.text}</p>
              <p className="mt-4 leading-relaxed text-muted">{step.detail}</p>
              <ul className="mt-6 space-y-3">
                {step.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
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
