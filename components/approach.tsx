"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { catalog } from "@/lib/i18n/catalog";
import { ui } from "@/lib/i18n/ui";

function DownArrow() {
  return (
    <svg viewBox="0 0 240 168" className="h-16 w-full md:h-40" aria-hidden="true">
      <path fill="currentColor" d="M78 6h84v52h62L120 154 16 58h62V6z" />
    </svg>
  );
}

export function Approach() {
  const locale = useLocale();
  const t = ui(locale);
  const { steps } = catalog(locale);
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const step = open === null ? null : steps[open];

  useEffect(() => {
    if (open === null) return;
    const previous = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }

    document.addEventListener("keydown", onKey);
    const earlierOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = earlierOverflow;
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <section id="approach" className="bg-canvas">
      <div className="mx-auto grid max-w-6xl md:grid-cols-12">
        <div className="flex flex-col border-l-8 border-accent bg-ink px-5 pt-6 pb-4 text-white md:col-span-5 md:px-10 md:pt-20 md:pb-8">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
            {t.approach}
          </h2>
          <p className="mt-3 text-sm leading-snug text-white/75 md:mt-6 md:text-lg md:leading-relaxed">
            {t.approachLead}
          </p>
          <p className="mt-4 border-t border-white/15 pt-4 text-sm leading-snug text-white/70 md:mt-10 md:pt-8 md:leading-relaxed">
            {t.approachPay}
          </p>
          <a
            href="#standards"
            className="mt-4 flex w-full justify-center text-accent md:mt-auto md:pt-16"
          >
            <DownArrow />
            <span className="sr-only">{t.standardsLink}</span>
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
                className="block w-full px-5 py-4 text-left md:px-12 md:py-10"
              >
                <span className="block font-display text-lg font-bold uppercase leading-tight tracking-wide md:text-2xl">
                  {item.title}
                </span>
                <span className="mt-1 block max-w-md text-sm leading-snug text-muted md:mt-3 md:text-base md:leading-relaxed">
                  {item.text}
                </span>
                <span className="mt-2 block font-display text-xs font-semibold uppercase tracking-[0.16em] text-foreground md:mt-4">
                  {t.details}
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
              <h3
                id={titleId}
                className="font-display text-3xl font-bold uppercase tracking-wide"
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
                {t.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
