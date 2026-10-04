import Image from "next/image";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <Image
        src="/hero-corporate.jpg"
        alt="Professionals in a dark boardroom overlooking a city skyline."
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="max-w-2xl">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Titan Safety Co.
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl">
            A clear path from interest to a qualified opportunity.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            We connect people with safety products, energy solutions, digital
            media, software development, and insurance affiliates—and help our
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
