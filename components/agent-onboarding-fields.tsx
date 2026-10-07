"use client";

import { useLocale } from "@/components/locale-provider";
import { ui } from "@/lib/i18n/ui";
import { states } from "@/lib/profile-details";

const yearValues = [
  "Less than 1 year",
  "1 to 3 years",
  "3 to 5 years",
  "More than 5 years",
];

const areaValues = [
  "Lead scouting",
  "Audience research",
  "Digital campaigns",
  "Onboarding support",
];

export function AgentOnboardingFields({
  programs,
}: {
  programs: readonly { id: string; name: string }[];
}) {
  const t = ui(useLocale());
  const maxDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.dateOfBirth}
        </span>
        <input
          name="birth"
          type="date"
          required
          max={maxDate}
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
        />
      </label>
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.stateLabel}
        </span>
        <select
          name="state"
          required
          defaultValue=""
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
        >
          <option value="" disabled>
            {t.chooseState}
          </option>
          {states.map(([code, label]) => (
            <option key={code} value={code}>
              {code} — {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.applyToProgram}
        </span>
        <select
          name="program"
          required
          defaultValue=""
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
        >
          <option value="" disabled>
            {t.chooseOne}
          </option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.secondProgram}
        </span>
        <select
          name="second"
          defaultValue=""
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
        >
          <option value="">{t.none}</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.experience}
        </span>
        <select
          name="years"
          required
          defaultValue=""
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
        >
          <option value="" disabled>
            {t.howLong}
          </option>
          {yearValues.map((year, index) => (
            <option key={year} value={year}>
              {t.years[index]}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.areas}
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {areaValues.map((area, index) => (
            <label key={area} className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="areas" value={area} className="h-4 w-4 accent-ink" />
              <span>{t.areaOptions[index]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block sm:col-span-2">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.relevantExperience}
        </span>
        <textarea
          name="background"
          required
          rows={5}
          maxLength={2000}
          placeholder={t.experiencePlaceholder}
          className="mt-2 w-full resize-y border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.note}
        </span>
        <textarea
          name="note"
          rows={3}
          maxLength={2000}
          className="mt-2 w-full resize-y border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
        />
      </label>
    </div>
  );
}
