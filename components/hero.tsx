import Image from "next/image";

export function Hero() {
  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-ink text-white">
      <Image
        src="/hero-corporate.jpg"
        alt="Professionals in a dark boardroom overlooking a city skyline."
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] max-w-6xl items-center px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Titan Safety Co.
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl">
            A clear path from interest to a qualified opportunity.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            We connect people with essential products and services—and help our
            partners turn that demand into business.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#work"
              className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400]"
            >
              Our work
            </a>
            <a
              href="#approach"
              className="border border-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-ink"
            >
              Approach
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
