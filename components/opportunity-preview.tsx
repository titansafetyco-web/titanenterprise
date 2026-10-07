import { OpportunityRail } from "@/components/opportunity-rail";
import { listOpportunities } from "@/lib/api/opportunities";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function OpportunityPreview() {
  const locale = await getLocale();
  const t = ui(locale);
  const { items, error } = await listOpportunities(locale);
  const labels = {
    payout: t.payout,
    verification: t.verification,
    level: t.level,
    remote: t.remote,
    yes: t.yes,
    no: t.no,
    trainingRequired: t.trainingRequired,
    trainingOptional: t.trainingOptional,
  };

  return (
    <section id="opportunities" className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-16">
        <div className="max-w-3xl border-l-4 border-accent pl-3 md:pl-5">
          <h2 className="font-display text-xl font-bold leading-tight md:text-4xl">{t.opportunitiesTitle}</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted md:mt-3 md:text-base">{t.opportunitiesLead}</p>
        </div>
        {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}
        {items.length === 0 ? (
          <p className="mt-5 bg-white px-4 py-5 text-sm text-muted md:px-5 md:py-6">{t.noOpportunity}</p>
        ) : (
          <OpportunityRail
            items={items}
            viewLabel={t.viewOpportunity}
            acceptLabel={t.signInToAccept}
            labels={labels}
            previousLabel={t.activityPrevious}
            nextLabel={t.activityNext}
          />
        )}
      </div>
    </section>
  );
}
