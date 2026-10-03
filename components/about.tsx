import Link from "next/link";

export function About() {
  return (
    <section id="about" className="border-y border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between md:py-10">
        <div className="border-l-4 border-accent pl-5">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            About
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
            Company bio
          </h2>
        </div>
        <Link
          href="/about"
          className="inline-flex w-fit bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400]"
        >
          Read the bio
        </Link>
      </div>
    </section>
  );
}
