import { ContactForm } from "@/components/contact-form";
import { Section } from "@/components/section";
import { site } from "@/lib/site";

export function Contact() {
  return (
    <Section id="contact" title="Contact" tone="dark">
      <p className="max-w-2xl font-display text-3xl font-bold uppercase leading-snug tracking-wide text-white md:text-4xl">
        A clear path from initial interest to a qualified opportunity.
      </p>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        Titan Safety Co. brings outreach, technology, and customer support
        together under one roof.
      </p>
      <ContactForm />
      {site.contactEmail ? (
        <a
          href={`mailto:${site.contactEmail}`}
          className="mt-8 inline-block bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink"
        >
          {site.contactEmail}
        </a>
      ) : null}
    </Section>
  );
}
