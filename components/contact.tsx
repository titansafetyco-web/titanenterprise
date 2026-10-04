import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site";

const notes = ["Outreach", "Technology", "Customer support"] as const;

export function Contact() {
  return (
    <section id="contact" className="bg-canvas">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid overflow-hidden border border-line bg-white md:grid-cols-12">
          <div className="flex h-full flex-col border-l-8 border-accent bg-ink px-6 py-8 text-white md:col-span-5 md:px-10 md:py-12">
            <h2 className="font-display text-4xl font-bold uppercase tracking-wide">
              <span className="flex items-center gap-4">
                <ContactIcon />
                Contact
              </span>
            </h2>
            <p className="mt-6 font-display text-2xl font-bold uppercase leading-snug tracking-wide">
              A clear path from initial interest to a qualified opportunity.
            </p>
            <p className="mt-6 leading-relaxed text-white/75">
              Titan Safety Co. brings outreach, technology, and customer
              support together under one roof. Ask about insurance affiliates
              for auto, home, renters, life, health, and business coverage.
            </p>
            <ul className="mt-8 grid gap-3 border-t border-white/15 pt-8">
              {notes.map((note) => (
                <li
                  key={note}
                  className="flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-wider"
                >
                  <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
                  {note}
                </li>
              ))}
            </ul>
            {site.contactEmail ? (
              <a
                href={`mailto:${site.contactEmail}`}
                className="mt-8 inline-block bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink"
              >
                {site.contactEmail}
              </a>
            ) : null}
          </div>
          <div className="px-6 py-8 md:col-span-7 md:px-10 md:py-12">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              Send a note
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-10 w-10 text-accent" aria-hidden="true">
      <rect
        x="3"
        y="7"
        width="26"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M4 8l12 10L28 8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
