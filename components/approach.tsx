import { steps } from "@/lib/site";

export function Approach() {
  return (
    <section id="approach" className="bg-canvas">
      <div className="mx-auto grid max-w-6xl md:grid-cols-12">
        <div className="border-l-8 border-accent bg-ink px-8 py-14 text-white md:col-span-5 md:px-10 md:py-20">
          <h2 className="font-display text-4xl font-bold uppercase tracking-wide">
            Approach
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/75">
            Through affiliate and referral programs, we identify prospective
            customers, introduce relevant offers, and guide interested
            applicants through signup and onboarding.
          </p>
          <p className="mt-10 border-t border-white/15 pt-8 text-sm leading-relaxed text-white/70">
            We earn commissions for qualified leads, approved applications,
            enrollments, or completed sales, depending on each partner’s
            program. We learn the requirements, explain the offer clearly, and
            help customers finish the process accurately.
          </p>
        </div>
        <ol className="border-t border-line bg-white md:col-span-7 md:border-l md:border-t-0">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-line px-8 py-8 last:border-b-0 md:px-12 md:py-10"
            >
              <span className="font-display text-sm font-bold tracking-[0.16em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-2xl font-bold uppercase leading-tight tracking-wide">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-muted">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
