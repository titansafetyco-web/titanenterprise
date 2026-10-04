"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useLocale } from "@/components/locale-provider";
import { catalog } from "@/lib/i18n/catalog";
import { ui } from "@/lib/i18n/ui";

const marks = [BrowserMark, LayoutMark, FormMark, ChartMark, NodesMark];

export function Technology() {
  const locale = useLocale();
  const t = ui(locale);
  const { tools } = catalog(locale);
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const tool = open === null ? null : tools[open];

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
    <section id="technology" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">
          <span className="flex items-center gap-3 sm:gap-4">
            <TechIcon />
            {t.techTitle}
          </span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-snug sm:mt-6 sm:text-lg sm:leading-relaxed">
          {t.techBody}
        </p>

        <div className="mt-6 overflow-hidden border border-line bg-ink text-white sm:mt-12">
          <div
            className="bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"
          >
            <div className="grid md:grid-cols-2">
              <Path
                label={t.media}
                from={t.messageWord}
                to={t.audience}
                note={t.mediaNote}
                sending={t.mediaSending}
                arrived={t.mediaArrived}
              />
              <Path
                label={t.software}
                from={t.inquiry}
                to={t.nextStep}
                note={t.softwareNote}
                sending={t.softwareSending}
                arrived={t.softwareArrived}
                edge
              />
            </div>
          </div>

          <ol className="grid grid-cols-2 border-t border-white/15 lg:grid-cols-5">
            {tools.map((item, index) => {
              const Mark = marks[index];
              return (
                <li
                  key={item.title}
                  className="border-b border-white/15 last:border-b-0 [&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(index)}
                    className="flex h-full w-full items-center gap-2.5 px-3 py-3 text-left transition-colors hover:bg-white/5 sm:block sm:px-6 sm:py-7"
                  >
                    {Mark ? <Mark /> : null}
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] sm:mt-5 sm:text-sm sm:tracking-[0.14em]">
                        {item.title}
                      </span>
                      <span className="mt-1 block font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-accent sm:mt-3 sm:text-xs sm:tracking-[0.16em]">
                        {t.details}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      {tool ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6"
          onClick={() => setOpen(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[calc(100svh-3rem)] w-full max-w-2xl overflow-y-auto border border-line bg-white text-foreground shadow-[0_24px_60px_rgba(16,24,32,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-56 bg-ink">
              <Image
                src={tool.image}
                alt=""
                fill
                sizes="42rem"
                className="object-cover"
              />
            </div>
            <div className="p-6 md:p-8">
              <h3
                id={titleId}
                className="font-display text-3xl font-bold uppercase tracking-wide"
              >
                {tool.title}
              </h3>
              <p className="mt-4 text-lg leading-relaxed">{tool.text}</p>
              <p className="mt-4 leading-relaxed text-muted">{tool.detail}</p>
              <ul className="mt-6 space-y-3">
                {tool.points.map((point) => (
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

type Phase = "idle" | "from" | "travel" | "arrived";

function Path({
  label,
  from,
  to,
  note,
  sending,
  arrived,
  edge = false,
}: {
  label: string;
  from: string;
  to: string;
  note: string;
  sending: string;
  arrived: string;
  edge?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function play() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setRun((value) => value + 1);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("arrived");
      return;
    }

    setPhase("from");
    timers.current.push(window.setTimeout(() => setPhase("travel"), 160));
    timers.current.push(window.setTimeout(() => setPhase("arrived"), 980));
  }

  const charged = phase === "travel" || phase === "arrived";
  const status = phase === "arrived" ? arrived : phase === "idle" ? note : sending;

  return (
    <div
      className={`px-4 py-4 sm:px-6 sm:py-10 md:px-10 ${edge ? "border-t border-white/15 md:border-l md:border-t-0" : ""} ${charged ? "shadow-[inset_0_0_48px_rgba(245,196,0,0.08)]" : ""}`}
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
        {label}
      </p>
      <div className="mt-3 flex items-center gap-2 sm:mt-6 sm:gap-3" role="group" aria-label={`${label} path`}>
        <Node lit={phase !== "idle"} onClick={play}>
          {from}
        </Node>
        <span className="relative h-3 min-w-8 flex-1" aria-hidden="true">
          <span className="absolute top-1/2 right-2 left-0 h-px -translate-y-1/2 bg-white/20" />
          <span
            className={`absolute top-1/2 left-0 h-px -translate-y-1/2 bg-accent shadow-[0_0_12px_rgba(245,196,0,0.95)] ${charged ? "w-[calc(100%-0.5rem)] transition-[width] duration-700 ease-linear" : "w-0"}`}
          />
          {phase === "travel" ? (
            <span
              key={run}
              className="tech-signal absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_6px_rgba(245,196,0,0.95)]"
            />
          ) : null}
          <span
            className={`absolute top-1/2 right-0 -translate-y-1/2 border-y-[5px] border-l-[8px] border-y-transparent ${charged ? "border-l-accent drop-shadow-[0_0_6px_rgba(245,196,0,0.9)]" : "border-l-white/35"}`}
          />
        </span>
        <Node lit={phase === "arrived"} onClick={play}>
          {to}
        </Node>
      </div>
      <p className="mt-2 text-xs leading-snug text-white/70 sm:mt-5 sm:text-sm sm:leading-relaxed" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

function Node({
  children,
  lit,
  onClick,
}: {
  children: ReactNode;
  lit: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-2 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] transition-[border-color,box-shadow,background-color] duration-300 sm:px-3 sm:py-2 sm:text-sm sm:tracking-[0.12em] ${
        lit
          ? "border-accent bg-accent/15 text-white shadow-[0_0_18px_rgba(245,196,0,0.75)]"
          : "border-white/25 bg-ink text-white hover:border-accent/70"
      }`}
    >
      {children}
    </button>
  );
}

function TechIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-accent sm:h-10 sm:w-10" aria-hidden="true">
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
    <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0 text-accent sm:h-8 sm:w-8" aria-hidden="true">
      <rect x="3" y="6" width="26" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h26" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="9" r="1" fill="currentColor" />
      <circle cx="11" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}

function LayoutMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0 text-accent sm:h-8 sm:w-8" aria-hidden="true">
      <rect x="4" y="4" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12h24M14 12v16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FormMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0 text-accent sm:h-8 sm:w-8" aria-hidden="true">
      <rect x="7" y="3" width="18" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 10h10M11 16h10M11 22h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChartMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0 text-accent sm:h-8 sm:w-8" aria-hidden="true">
      <path d="M4 26h24" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 26V16M14 26V10M20 26V18M26 26V8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function NodesMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0 text-accent sm:h-8 sm:w-8" aria-hidden="true">
      <circle cx="8" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 14.5 21 9.2M11 17.5 21 22.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
