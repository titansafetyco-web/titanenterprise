import type { Metadata } from "next";
import Image from "next/image";
import { AffiliateForm } from "@/components/affiliate-form";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { listPrograms } from "@/lib/programs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate programs · Titan Safety Co.",
  description:
    "Titan Safety Co. works through affiliate and referral programs, earning commissions for qualified leads, approved applications, enrollments, or completed sales, depending on each partner’s program.",
};

export default async function AffiliatePage() {
  const programs = await listPrograms();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative isolate min-h-[32rem] overflow-hidden bg-ink text-white md:min-h-[38rem]">
          <Image
            src="/affiliate-hero.jpg"
            alt="Two professionals reviewing a folder in a bright office."
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/25" />
          <div className="relative mx-auto flex min-h-[32rem] max-w-6xl items-center px-6 py-20 md:min-h-[38rem] md:py-28">
            <div className="max-w-3xl">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
                Affiliate programs
              </p>
              <h1 className="mt-6 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">
                A practical path from a partner’s offer to a qualified
                opportunity.
              </h1>
            </div>
          </div>
        </section>
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-12 md:py-24">
            <div className="md:col-span-7 space-y-6 text-lg leading-relaxed">
              <p>
                Titan Safety Co. connects people with essential products and
                services—and helps our partners turn that demand into business.
                Our name reflects that purpose: helping individuals and
                businesses make confident decisions about the services they rely
                on.
              </p>
              <p>
                We bring together safety products, energy solutions, digital
                media, and software development with a practical approach to
                customer acquisition. Through affiliate and referral programs,
                we identify prospective customers, introduce relevant offers,
                and guide interested applicants through signup and onboarding.
              </p>
              <p>
                That work follows a clear sequence. Lead scouting finds people
                whose needs match a partner’s program. Audience research learns
                who the offer is for, and what a clear decision requires.
                Digital campaigns present the offer plainly, where that audience
                already is. Onboarding support guides interested applicants
                through signup, accurately and completely.
              </p>
              <p>
                Our business earns commissions for qualified leads, approved
                applications, enrollments, or completed sales, depending on each
                partner’s program. What we earn is set by that program. It is
                not a promise that a particular application, enrollment, or sale
                will be approved.
              </p>
              <p>
                Consent, lead quality, and reliable follow-through are central
                to how we work. People hear a clear offer and choose whether to
                continue. Inquiries are matched to partner requirements before
                they move forward. We stay with the process until the next step
                is done.
              </p>
              <p>
                Behind that process is our technology. We develop websites,
                landing pages, intake forms, dashboards, and workflow tools that
                support campaigns, organize inquiries, and track results. Media
                connects the message to the audience. Software connects the
                inquiry to the next step.
              </p>
              <p>
                Titan Safety Co. brings outreach, technology, and customer
                support together under one roof—creating a clear path from
                initial interest to a qualified opportunity.
              </p>
            </div>
            <div className="border-l-4 border-accent bg-canvas px-6 py-8 md:col-span-5">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                Onboarding
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide">
                Choose a program
              </h2>
              <AffiliateForm programs={programs} />
            </div>
          </div>
        </section>
      </main>
      <Footer name={site.name} />
    </>
  );
}
