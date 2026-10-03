import { standards } from "@/lib/site";

export function Standards() {
  return (
    <section id="standards" className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h2 className="font-display text-4xl font-bold uppercase tracking-wide">
          Standards
          <span className="mt-3 block h-1 w-12 bg-accent" aria-hidden="true" />
        </h2>
        <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
          {standards.map((item, index) => (
            <li key={item.title} className="border-t-4 border-accent pt-8">
              <span className="font-display text-sm font-bold tracking-[0.16em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-display text-3xl font-bold uppercase leading-none tracking-wide">
                {item.title}
              </h3>
              <p className="mt-5 max-w-xs text-base leading-relaxed text-white/75">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
