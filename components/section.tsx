import type { ReactNode } from "react";

const tones = {
  light: "bg-white",
  gray: "bg-canvas",
  dark: "bg-ink [--foreground:#ffffff] [--muted:rgba(255,255,255,0.72)] [--line:rgba(255,255,255,0.16)]",
} as const;

export function Section({
  id,
  title,
  tone = "light",
  children,
}: {
  id: string;
  title: string;
  tone?: keyof typeof tones;
  children: ReactNode;
}) {
  return (
    <section id={id} className={tones[tone]}>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-12 md:gap-12 md:py-24">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground md:sticky md:top-28 md:col-span-3 md:self-start">
          {title}
          <span className="mt-3 block h-1 w-12 bg-accent" aria-hidden="true" />
        </h2>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  );
}
