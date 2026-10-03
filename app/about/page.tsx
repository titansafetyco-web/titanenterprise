import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About · Titan Safety Co.",
  description: site.description,
};

const chapters = [
  {
    label: "Purpose",
    text: "Our name reflects our purpose: helping individuals and businesses make confident decisions about the services they rely on. We bring together safety products, energy solutions, digital media, and software development with a practical approach to customer acquisition.",
  },
  {
    label: "Programs",
    text: "Through affiliate and referral programs, we identify prospective customers, introduce relevant offers, and guide interested applicants through signup and onboarding. Our business earns commissions for qualified leads, approved applications, enrollments, or completed sales, depending on each partner’s program.",
  },
  {
    label: "Approach",
    text: "Our approach combines lead scouting, audience research, digital campaigns, and hands-on onboarding support. We focus on understanding partner requirements, communicating offers clearly, and helping customers complete the process accurately. Consent, lead quality, and reliable follow-through are central to how we work.",
  },
  {
    label: "Technology",
    text: "Behind that process is our technology capability. We develop websites, landing pages, intake forms, dashboards, and workflow tools that support campaigns, organize inquiries, and track results. Our media work connects the message to the audience; our software connects the inquiry to the next step.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              Company bio
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">
              Titan Safety Co. connects people with essential products and
              services—and helps our partners turn that demand into business.
            </h1>
          </div>
        </section>
        <section className="bg-white">
          <ol className="mx-auto max-w-6xl">
            {chapters.map((chapter, index) => (
              <li
                key={chapter.label}
                className="grid gap-4 border-b border-line px-6 py-12 last:border-b-0 md:grid-cols-12 md:gap-16 md:py-16"
              >
                <div className="md:col-span-4">
                  <p className="font-display text-sm font-semibold tracking-[0.16em] text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide">
                    {chapter.label}
                  </h2>
                </div>
                <p className="max-w-xl text-lg leading-relaxed text-foreground md:col-span-8">
                  {chapter.text}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section className="bg-canvas">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <p className="max-w-3xl border-l-4 border-accent pl-6 font-display text-3xl font-bold uppercase leading-snug tracking-wide md:text-4xl">
              Titan Safety Co. brings outreach, technology, and customer support
              together under one roof—creating a clear path from initial
              interest to a qualified opportunity.
            </p>
            <Link
              href="/#work"
              className="mt-10 inline-block bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400]"
            >
              Our work
            </Link>
          </div>
        </section>
      </main>
      <Footer name={site.name} />
    </>
  );
}
