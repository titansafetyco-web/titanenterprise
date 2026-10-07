"use client";

import { useActionState, useState } from "react";
import {
  sendApplication,
  type ApplicationState,
} from "@/app/affiliate/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import { formatPhone } from "@/lib/phone";

const initialState: ApplicationState = { error: "", ok: false };

export function AffiliateForm({
  programs,
}: {
  programs: readonly { id: string; name: string }[];
}) {
  const t = ui(useLocale());
  const [formKey, setFormKey] = useState(0);

  if (programs.length === 0) {
    return <p className="mt-8 text-muted">{t.noPrograms}</p>;
  }

  return (
    <AffiliateFields
      key={formKey}
      programs={programs}
      onReset={() => setFormKey((value) => value + 1)}
    />
  );
}

function AffiliateFields({
  programs,
  onReset,
}: {
  programs: readonly { id: string; name: string }[];
  onReset: () => void;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const [state, formAction, pending] = useActionState(
    sendApplication,
    initialState,
  );
  const [phone, setPhone] = useState("");
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

  if (state.ok) {
    return (
      <div className="mt-8 border-l-4 border-accent pl-4" role="status">
        <p className="font-display text-2xl font-bold uppercase tracking-wide">
          {t.submitted}
        </p>
        <p className="mt-3 text-muted">{t.submittedBody}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-6 border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-ink hover:text-white"
        >
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 grid gap-5 md:grid-cols-2">
      <Field label={t.name} name="name" type="text" autoComplete="name" />
      <Field label={t.email} name="email" type="email" autoComplete="email" />
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.phone}
        </span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="(555) 555-0100"
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
          className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
        />
      </label>
        <Menu label={t.applyToProgram} name="program" programs={programs} required emptyLabel={t.chooseOne} />
      <Menu
        label={t.secondProgram}
        name="second"
        programs={programs}
        emptyLabel={t.none}
      />
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.experience}
        </span>
        <select
          name="years"
          required
          defaultValue=""
          className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
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
      <fieldset className="md:col-span-2">
        <legend className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.areas}
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {areaValues.map((area, index) => (
            <label key={area} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="areas"
                value={area}
                className="h-4 w-4 accent-ink"
              />
              <span>{t.areaOptions[index]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block md:col-span-2">
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
      <label className="block md:col-span-2">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.note}
        </span>
        <textarea
          name="note"
          rows={4}
          maxLength={2000}
          className="mt-2 w-full resize-y border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
        />
      </label>
      {state.error ? (
        <p role="alert" className="border-l-4 border-accent pl-3 text-sm md:col-span-2">
          {localizeError(locale, state.error)}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400] disabled:opacity-60 md:col-span-2"
      >
        {pending ? t.pleaseWait : t.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
      />
    </label>
  );
}

function Menu({
  label,
  name,
  programs,
  required = false,
  emptyLabel = "Choose one",
}: {
  label: string;
  name: string;
  programs: readonly { id: string; name: string }[];
  required?: boolean;
  emptyLabel?: string;
}) {
  return (
    <label className="block">
      <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-2 w-full border border-line bg-white px-3 py-3 outline-none focus-visible:border-accent"
      >
        <option value="" disabled={required}>
          {emptyLabel}
        </option>
        {programs.map((program) => (
          <option key={program.id} value={program.id}>
            {program.name}
          </option>
        ))}
      </select>
    </label>
  );
}
