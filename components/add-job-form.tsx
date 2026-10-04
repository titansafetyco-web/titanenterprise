"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { addJobAction, type JobState } from "@/app/jobs/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";

const initialState: JobState = { error: "" };
const fieldLabel = "font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted";
const fieldClass =
  "mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent";

export function AddJobForm() {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addJobAction, initialState);
  const wasPending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, router, state.error]);

  return (
    <form
      id="listing"
      ref={formRef}
      action={formAction}
      className="space-y-5 bg-white px-6 py-6"
    >
      <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{t.addJob}</h2>
      <label className="block">
        <span className={fieldLabel}>{t.jobTitle}</span>
        <input name="title" required className={fieldClass} />
      </label>
      <label className="block">
        <span className={fieldLabel}>{t.jobProgram}</span>
        <select name="program" required defaultValue="" className={fieldClass}>
          <option value="">{t.jobProgram}</option>
          <option value="safety">{t.jobProgramSafety}</option>
          <option value="energy">{t.jobProgramEnergy}</option>
          <option value="media">{t.jobProgramMedia}</option>
          <option value="software">{t.jobProgramSoftware}</option>
          <option value="insurance">{t.jobProgramInsurance}</option>
        </select>
      </label>
      <label className="block">
        <span className={fieldLabel}>{t.jobDescription}</span>
        <textarea name="description" required rows={4} className={fieldClass} />
      </label>
      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className={fieldLabel}>{t.jobDate}</span>
          <input name="startsOn" type="date" required className={fieldClass} />
        </label>
        <label className="block">
          <span className={fieldLabel}>{t.jobPaid}</span>
          <span className="relative mt-2 block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              name="amount"
              inputMode="decimal"
              required
              placeholder="0.00"
              className="w-full border border-line bg-white py-3 pl-7 pr-3 text-foreground outline-none focus-visible:border-accent"
            />
          </span>
        </label>
        <label className="block">
          <span className={fieldLabel}>{t.payTiming}</span>
          <select name="pay" required defaultValue="weekly" className={fieldClass}>
            <option value="weekly">{t.payWeekly}</option>
            <option value="biweekly">{t.payBiweekly}</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className={fieldLabel}>{t.jobMessage}</span>
        <textarea name="message" required rows={4} className={fieldClass} />
      </label>
      <label className="block">
        <span className={fieldLabel}>{t.jobLink}</span>
        <input name="link" type="url" required placeholder="https://" className={fieldClass} />
      </label>
      {state.error ? (
        <p role="alert" className="border-l-4 border-accent pl-3 text-sm">
          {localizeError(locale, state.error)}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
      >
        {pending ? t.pleaseWait : t.addJob}
      </button>
    </form>
  );
}
