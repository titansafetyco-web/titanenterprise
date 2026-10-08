import { ContactForm } from "@/components/contact-form";
import { OpenChatButton } from "@/components/open-chat-button";
import { contactChoices } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { site } from "@/lib/site";

export async function Contact({ warm = false }: { warm?: boolean }) {
  const locale = await getLocale();
  const t = ui(locale);

  return (
    <section id="contact" className={`scroll-mt-28 ${warm ? "bg-[#f6f0e4]" : "bg-canvas"}`}>
      <div className={`mx-auto max-w-6xl px-6 py-8 sm:py-16 ${warm ? "md:pb-20 md:pt-2" : "md:py-24"}`}>
        <div
          className={`grid overflow-hidden md:grid-cols-12 ${
            warm
              ? "border border-[#ead9b2] bg-[#fff8ee] shadow-[0_20px_50px_rgba(90,60,10,0.08)]"
              : "border border-line bg-white"
          }`}
        >
          <div
            className={`flex h-full flex-col border-l-8 border-accent px-5 py-5 text-white sm:px-6 sm:py-8 md:col-span-5 md:px-10 md:py-12 ${
              warm ? "bg-[#3a2a14]" : "bg-ink"
            }`}
          >
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">
              <span className="flex items-center gap-3 sm:gap-4">
                <ContactIcon />
                {t.contact}
              </span>
            </h2>
            <p className="mt-3 font-display text-lg font-bold uppercase leading-tight tracking-wide sm:mt-6 sm:text-2xl sm:leading-snug">
              {t.contactTitle}
            </p>
            <p className="mt-3 text-sm leading-snug text-white/75 sm:mt-6 sm:text-base sm:leading-relaxed">
              {t.contactBody}
            </p>
            <a
              href={`mailto:${site.contactEmail}`}
              className="mt-4 text-base font-semibold text-accent underline-offset-4 hover:underline"
            >
              {site.contactEmail}
            </a>
            <OpenChatButton label={t.support} />
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/15 pt-4 sm:mt-8 sm:grid sm:gap-3 sm:pt-8">
              {t.contactNotes.map((note) => (
                <li
                  key={note}
                  className="flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-wider"
                >
                  <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-5 py-5 sm:px-6 sm:py-8 md:col-span-7 md:px-10 md:py-12">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              {t.sendNote}
            </p>
            <ContactForm topics={contactChoices(locale)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-accent sm:h-10 sm:w-10" aria-hidden="true">
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
