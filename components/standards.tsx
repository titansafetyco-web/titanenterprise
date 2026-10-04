import { standards } from "@/lib/site";

export function Standards() {
  return (
    <section id="standards" className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-bold uppercase tracking-wide">
            Standards
            <span
              className="mt-3 block h-1 w-12 bg-accent"
              aria-hidden="true"
            />
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/75">
            Consent, lead quality, and reliable follow-through are central to
            how we work.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {standards.map((item) => (
            <li
              key={item.title}
              className="border-l-4 border-accent bg-white px-6 py-8 text-foreground"
            >
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="mt-4 leading-relaxed text-muted">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
