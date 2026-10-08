import { TestimonialRail } from "@/components/testimonial-rail";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listPublicTestimonials } from "@/lib/testimonials";

export async function Testimonials() {
  const locale = await getLocale();
  const t = ui(locale);
  const stored = await listPublicTestimonials(locale);
  const notes = stored ?? t.testimonials.map((item) => ({ ...item, stars: 5, photoUrl: "" }));

  return (
    <section id="testimonials" className="border-y border-[#dadce0] bg-[#f8f9fa]">
      <div className="flex h-1" aria-hidden="true">
        <span className="flex-1 bg-[#4285F4]" />
        <span className="flex-1 bg-[#EA4335]" />
        <span className="flex-1 bg-[#FBBC05]" />
        <span className="flex-1 bg-[#34A853]" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-medium tracking-tight text-[#202124] md:text-[2rem]">{t.testimonialTitle}</h2>
        </div>
        {notes.length === 0 ? (
          <p className="mt-5 text-sm text-[#5f6368]">{t.noReviews}</p>
        ) : (
          <TestimonialRail notes={notes} starsLabel={t.testimonialStars} />
        )}
      </div>
    </section>
  );
}
