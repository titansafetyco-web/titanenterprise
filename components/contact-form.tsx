"use client";

import { useActionState, useEffect, useState } from "react";
import { sendMessage, type ContactState } from "@/app/contact/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";

const initialState: ContactState = { error: "", ok: false };

export function ContactForm({
  topics,
}: {
  topics: readonly { value: string; label: string }[];
}) {
  const [formKey, setFormKey] = useState(0);

  return (
    <ContactFields
      key={formKey}
      topics={topics}
      onReset={() => setFormKey((value) => value + 1)}
    />
  );
}

function ContactFields({
  topics,
  onReset,
}: {
  topics: readonly { value: string; label: string }[];
  onReset: () => void;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const [state, formAction, pending] = useActionState(sendMessage, initialState);

  useEffect(() => {
    if (!state.ok) return;
    const section = document.getElementById("contact");
    if (!section) return;
    const place = () => {
      const top = section.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    };
    place();
    const until = performance.now() + 3000;
    const onScroll = () => {
      if (performance.now() > until) return;
      if (window.scrollY < 200) place();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const stop = window.setTimeout(() => window.removeEventListener("scroll", onScroll), 3100);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(stop);
    };
  }, [state.ok]);

  if (state.ok) {
    return (
      <div className="mt-6 border-l-4 border-accent pl-4" role="status">
        <p className="font-display text-2xl font-bold uppercase tracking-wide">
          {t.messageReceived}
        </p>
        <p className="mt-3 max-w-xl text-muted">
          {t.thanksNote}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-6 border border-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-ink"
        >
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-5">
      <Field label={t.name} name="name" type="text" autoComplete="name" />
      <Field label={t.email} name="email" type="email" autoComplete="email" />
      <label className="col-span-2 block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.subject}
        </span>
        <select
          name="interest"
          required
          defaultValue=""
          className="mt-1 w-full border border-line bg-white px-3 py-2 text-ink outline-none focus-visible:border-accent sm:mt-2 sm:py-3"
        >
          <option value="" disabled>
            {t.chooseOne}
          </option>
          {topics.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </select>
      </label>
      <label className="col-span-2 block">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t.message}
        </span>
        <textarea
          name="message"
          required
          rows={5}
          minLength={10}
          maxLength={2000}
          className="mt-1 h-20 w-full resize-y border border-line bg-white px-3 py-2 text-ink outline-none focus-visible:border-accent sm:mt-2 sm:h-36 sm:py-3"
        />
      </label>
      {state.error ? (
        <p role="alert" className="col-span-2 border-l-4 border-accent pl-3 text-sm">
          {localizeError(locale, state.error)}
        </p>
      ) : null}
      <div className="col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400] disabled:opacity-60"
        >
          {pending ? t.pleaseWait : t.sendMessage}
        </button>
      </div>
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
        className="mt-1 w-full border border-line bg-white px-3 py-2 text-ink outline-none focus-visible:border-accent sm:mt-2 sm:py-3"
      />
    </label>
  );
}
