"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { addJobAction, type JobState } from "@/app/jobs/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";

const initialState: JobState = { error: "" };

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
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.jobTitle}
        </span>
        <input
          name="title"
          required
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
        />
      </label>
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.jobDescription}
        </span>
        <textarea
          name="description"
          required
          rows={4}
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
        />
      </label>
      <label className="block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.payTiming}
        </span>
        <select
          name="pay"
          required
          defaultValue="weekly"
          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
        >
          <option value="weekly">{t.payWeekly}</option>
          <option value="biweekly">{t.payBiweekly}</option>
        </select>
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
